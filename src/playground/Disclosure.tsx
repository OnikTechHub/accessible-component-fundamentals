"use client";

import React, {
  useId,
  useState,
  useCallback,
  type ReactNode,
  type KeyboardEvent,
} from "react";

export interface DisclosureProps {
  /** Title or trigger content rendered inside the toggle button */
  title: ReactNode;
  /** Content revealed when disclosure is expanded */
  children: ReactNode;
  /** Controlled open state */
  isOpen?: boolean;
  /** Default open state for uncontrolled usage */
  defaultOpen?: boolean;
  /** Callback fired when open state toggles */
  onToggle?: (isOpen: boolean) => void;
  /** Optional icon rendered on the left of title */
  icon?: ReactNode;
  /** Optional badge or summary meta rendered on right side of title */
  badge?: ReactNode;
  /** Custom ID for trigger; if omitted, an accessible unique ID is generated */
  id?: string;
  /** Whether the disclosure button is disabled */
  disabled?: boolean;
  /** Optional extra CSS classes */
  className?: string;
}

export function Disclosure({
  title,
  children,
  isOpen: controlledIsOpen,
  defaultOpen = false,
  onToggle,
  icon,
  badge,
  id: customId,
  disabled = false,
  className = "",
}: DisclosureProps): React.JSX.Element {
  const generatedId = useId();
  const baseId = customId ?? `disclosure-${generatedId}`;
  const triggerId = `${baseId}-trigger`;
  const panelId = `${baseId}-panel`;

  const [uncontrolledIsOpen, setUncontrolledIsOpen] = useState<boolean>(defaultOpen);

  const isExpanded =
    controlledIsOpen !== undefined ? controlledIsOpen : uncontrolledIsOpen;

  const handleToggle = useCallback(() => {
    if (disabled) return;
    const nextState = !isExpanded;
    if (controlledIsOpen === undefined) {
      setUncontrolledIsOpen(nextState);
    }
    onToggle?.(nextState);
  }, [disabled, isExpanded, controlledIsOpen, onToggle]);

  const handleKeyDown = useCallback(
    (event: KeyboardEvent<HTMLButtonElement>) => {
      if (disabled) return;
      // Native button handles Enter and Space, but we ensure Space does not scroll the window
      if (event.key === " " || event.key === "Spacebar") {
        event.preventDefault();
        handleToggle();
      } else if (event.key === "Enter") {
        event.preventDefault();
        handleToggle();
      }
    },
    [disabled, handleToggle]
  );

  return (
    <div
      className={`rounded-xl border border-border bg-card text-card-foreground shadow-xs overflow-hidden transition-all duration-200 ${
        isExpanded ? "ring-1 ring-border" : ""
      } ${className}`}
    >
      <h3>
        <button
          id={triggerId}
          type="button"
          aria-expanded={isExpanded}
          aria-controls={panelId}
          disabled={disabled}
          onClick={handleToggle}
          onKeyDown={handleKeyDown}
          className={`w-full flex items-start sm:items-center justify-between gap-3 sm:gap-4 p-3.5 sm:p-4 text-left font-medium transition-colors select-none ${
            disabled
              ? "opacity-50 cursor-not-allowed bg-muted/30"
              : "hover:bg-muted/40 cursor-pointer"
          } focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background`}
        >
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0 pr-1">
            {icon && (
              <span className="shrink-0 text-muted-foreground" aria-hidden="true">
                {icon}
              </span>
            )}
            <span className="font-semibold text-foreground text-xs sm:text-sm md:text-base leading-snug break-words">
              {title}
            </span>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0 pt-0.5 sm:pt-0">
            {badge && (
              <span className="text-[11px] sm:text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground font-normal">
                {badge}
              </span>
            )}
            <svg
              className={`w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground transition-transform duration-200 ease-in-out shrink-0 ${
                isExpanded ? "rotate-180 text-foreground" : "rotate-0"
              }`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </div>
        </button>
      </h3>

      <div
        id={panelId}
        role="region"
        aria-labelledby={triggerId}
        hidden={!isExpanded}
        className={`px-3.5 sm:px-4 pb-3.5 sm:pb-4 pt-1 text-xs sm:text-sm text-muted-foreground border-t border-border/50 leading-relaxed transition-all ${
          isExpanded ? "block animate-in fade-in duration-200" : "hidden"
        }`}
      >
        <div className="pt-2">{children}</div>
      </div>
    </div>
  );
}

export interface DisclosureGroupProps {
  /** Allow multiple panels open simultaneously. Defaults to true. */
  allowMultiple?: boolean;
  /** Children elements (Disclosure components) */
  children: ReactNode;
  /** Optional container class name */
  className?: string;
}

export function DisclosureGroup({
  children,
  className = "",
}: DisclosureGroupProps): React.JSX.Element {
  return <div className={`space-y-3 ${className}`}>{children}</div>;
}
