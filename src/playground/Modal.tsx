"use client";

import React, {
  useEffect,
  useRef,
  useId,
  useCallback,
  type ReactNode,
  type MouseEvent,
} from "react";
import { createPortal } from "react-dom";

export interface ModalProps {
  /** Controls whether the modal dialog is open */
  isOpen: boolean;
  /** Callback triggered when the modal requests to close (via Escape, backdrop, or close button) */
  onClose: () => void;
  /** Primary title of the dialog, announced by screen readers via aria-labelledby */
  title: string;
  /** Optional subtitle or description announced via aria-describedby */
  description?: string;
  /** Content rendered inside the modal body */
  children: ReactNode;
  /** Optional custom footer actions (e.g. Cancel and Confirm buttons) */
  footer?: ReactNode;
  /** Whether clicking the backdrop overlay closes the modal. Defaults to true. */
  closeOnBackdropClick?: boolean;
  /** Whether pressing Escape closes the modal. Defaults to true. */
  closeOnEscape?: boolean;
  /** Optional ref to an element inside the dialog that should receive focus first upon opening */
  initialFocusRef?: React.RefObject<HTMLElement | null>;
  /** Custom ARIA role. Defaults to 'dialog', can be 'alertdialog' for destructive confirmations */
  role?: "dialog" | "alertdialog";
  /** Optional size variant for modal dialog width */
  size?: "sm" | "md" | "lg" | "xl";
  /** Optional extra CSS class names for modal container */
  className?: string;
}

const FOCUSABLE_SELECTOR = [
  'a[href]:not([tabindex="-1"])',
  'area[href]:not([tabindex="-1"])',
  'input:not([disabled]):not([type="hidden"]):not([tabindex="-1"])',
  'select:not([disabled]):not([tabindex="-1"])',
  'textarea:not([disabled]):not([tabindex="-1"])',
  'button:not([disabled]):not([tabindex="-1"])',
  'iframe:not([tabindex="-1"])',
  '[tabindex]:not([tabindex="-1"])',
  '[contenteditable="true"]:not([tabindex="-1"])',
].join(", ");

export function Modal({
  isOpen,
  onClose,
  title,
  description,
  children,
  footer,
  closeOnBackdropClick = true,
  closeOnEscape = true,
  initialFocusRef,
  role = "dialog",
  size = "md",
  className = "",
}: ModalProps): React.ReactPortal | null {
  const dialogId = useId();
  const titleId = `modal-title-${dialogId}`;
  const descriptionId = description ? `modal-desc-${dialogId}` : undefined;

  const dialogRef = useRef<HTMLDivElement | null>(null);
  const portalContainerRef = useRef<HTMLDivElement | null>(null);
  const previousActiveElementRef = useRef<HTMLElement | null>(null);

  // useSyncExternalStore is the idiomatic React 18/19 pattern for client mount detection without cascading renders
  const isMounted = React.useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );

  // Save the currently focused element before opening to restore on close
  useEffect(() => {
    if (isOpen) {
      if (document.activeElement instanceof HTMLElement) {
        previousActiveElementRef.current = document.activeElement;
      }
    } else if (previousActiveElementRef.current) {
      // Return focus strictly to the triggering element
      const returnTarget = previousActiveElementRef.current;
      previousActiveElementRef.current = null;
      requestAnimationFrame(() => {
        returnTarget.focus();
      });
    }
  }, [isOpen]);

  // Clean-up return focus if unmounted while open
  useEffect(() => {
    return () => {
      if (previousActiveElementRef.current) {
        previousActiveElementRef.current.focus();
      }
    };
  }, []);

  // Lock background body scroll and mark background DOM tree as aria-hidden for screen reader isolation
  useEffect(() => {
    if (!isOpen) return;

    // 1. Lock body scroll with scrollbar width compensation
    const originalOverflow = document.body.style.overflow;
    const originalPaddingRight = document.body.style.paddingRight;
    const scrollbarWidth =
      window.innerWidth - document.documentElement.clientWidth;

    document.body.style.overflow = "hidden";
    if (scrollbarWidth > 0) {
      document.body.style.paddingRight = `${scrollbarWidth}px`;
    }

    // 2. Mark sibling root elements as aria-hidden to prevent screen reader virtual cursor leakage
    const originalSiblings: Array<{ node: Element; prevAriaHidden: string | null }> = [];
    const portalNode = portalContainerRef.current;

    Array.from(document.body.children).forEach((child) => {
      if (child !== portalNode && !child.contains(portalNode)) {
        originalSiblings.push({
          node: child,
          prevAriaHidden: child.getAttribute("aria-hidden"),
        });
        child.setAttribute("aria-hidden", "true");
      }
    });

    return () => {
      document.body.style.overflow = originalOverflow;
      document.body.style.paddingRight = originalPaddingRight;

      originalSiblings.forEach(({ node, prevAriaHidden }) => {
        if (prevAriaHidden === null) {
          node.removeAttribute("aria-hidden");
        } else {
          node.setAttribute("aria-hidden", prevAriaHidden);
        }
      });
    };
  }, [isOpen]);

  // Focus trap and initial focus management
  useEffect(() => {
    if (!isOpen) return;

    const dialogNode = dialogRef.current;
    if (!dialogNode) return;

    // Set initial focus
    requestAnimationFrame(() => {
      if (initialFocusRef?.current) {
        initialFocusRef.current.focus();
      } else {
        const focusableElements = dialogNode.querySelectorAll<HTMLElement>(
          FOCUSABLE_SELECTOR
        );
        const visibleFocusable = Array.from(focusableElements).filter(
          (el) => el.offsetParent !== null || el.getBoundingClientRect().width > 0
        );

        if (visibleFocusable.length > 0) {
          visibleFocusable[0].focus();
        } else {
          dialogNode.focus();
        }
      }
    });

    // Keyboard event listener for Escape key and Tab focus trap
    const handleKeyDown = (event: KeyboardEvent) => {
      if (closeOnEscape && event.key === "Escape") {
        event.preventDefault();
        event.stopPropagation();
        onClose();
        return;
      }

      if (event.key === "Tab") {
        const focusableElements = dialogNode.querySelectorAll<HTMLElement>(
          FOCUSABLE_SELECTOR
        );
        const visibleFocusable = Array.from(focusableElements).filter(
          (el) => el.offsetParent !== null || el.getBoundingClientRect().width > 0
        );

        if (visibleFocusable.length === 0) {
          event.preventDefault();
          dialogNode.focus();
          return;
        }

        const firstElement = visibleFocusable[0];
        const lastElement = visibleFocusable[visibleFocusable.length - 1];
        const activeElement = document.activeElement;

        if (event.shiftKey) {
          // Shift + Tab: moving backwards
          if (
            activeElement === firstElement ||
            activeElement === dialogNode ||
            !dialogNode.contains(activeElement)
          ) {
            event.preventDefault();
            lastElement.focus();
          }
        } else {
          // Tab: moving forwards
          if (
            activeElement === lastElement ||
            !dialogNode.contains(activeElement)
          ) {
            event.preventDefault();
            firstElement.focus();
          }
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, closeOnEscape, onClose, initialFocusRef]);

  // Handle backdrop mouse click safely (only close if click originated on backdrop)
  const handleBackdropClick = useCallback(
    (e: MouseEvent<HTMLDivElement>) => {
      if (e.target === e.currentTarget && closeOnBackdropClick) {
        onClose();
      }
    },
    [closeOnBackdropClick, onClose]
  );

  if (!isOpen || !isMounted) {
    return null;
  }

  const sizeClasses = {
    sm: "max-w-sm",
    md: "max-w-lg",
    lg: "max-w-2xl",
    xl: "max-w-4xl",
  }[size];

  const modalContent = (
    <div
      ref={portalContainerRef}
      role="presentation"
      onClick={handleBackdropClick}
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
    >
      <div
        ref={dialogRef}
        role={role}
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={descriptionId}
        tabIndex={-1}
        className={`relative w-full ${sizeClasses} max-h-[90vh] overflow-y-auto rounded-xl sm:rounded-2xl bg-background border border-border text-foreground shadow-2xl p-4 sm:p-6 focus:outline-none animate-in zoom-in-95 duration-200 ${className}`}
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-3 sm:gap-4 pb-3.5 sm:pb-4 border-b border-border">
          <div className="space-y-1 min-w-0 pr-2">
            <h2
              id={titleId}
              className="text-lg sm:text-xl font-semibold tracking-tight text-foreground leading-snug break-words"
            >
              {title}
            </h2>
            {description && (
              <p id={descriptionId} className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                {description}
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close dialog"
            className="shrink-0 rounded-lg p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="py-3.5 sm:py-4 text-xs sm:text-sm text-foreground/90">{children}</div>

        {/* Footer */}
        {footer && (
          <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2 pt-3.5 sm:pt-4 border-t border-border">
            {footer}
          </div>
        )}
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}
