"use client";

import React, {
  useId,
  useRef,
  useState,
  useCallback,
  type ReactNode,
  type KeyboardEvent,
} from "react";

export interface TabItem {
  /** Unique identifier for the tab */
  id: string;
  /** Label rendered inside the tab button */
  label: ReactNode;
  /** Content rendered inside the associated tabpanel */
  content: ReactNode;
  /** Whether this tab is disabled */
  disabled?: boolean;
}

export interface TabsProps {
  /** Array of tab items with id, label, and content */
  tabs: TabItem[];
  /** Controlled active tab ID */
  value?: string;
  /** Initial active tab ID for uncontrolled usage */
  defaultValue?: string;
  /** Callback fired when active tab changes */
  onChange?: (tabId: string) => void;
  /** Orientation of the tabs. Defaults to 'horizontal'. */
  orientation?: "horizontal" | "vertical";
  /**
   * Activation mode:
   * - 'automatic': Moving focus via arrow keys automatically activates the tab.
   * - 'manual': Moving focus via arrow keys only moves focus; pressing Enter or Space activates it.
   * Defaults to 'automatic'.
   */
  activationMode?: "automatic" | "manual";
  /** Accessible label for the tablist container */
  ariaLabel?: string;
  /** Optional extra CSS class names */
  className?: string;
}

export function Tabs({
  tabs,
  value,
  defaultValue,
  onChange,
  orientation = "horizontal",
  activationMode = "automatic",
  ariaLabel = "Content tabs",
  className = "",
}: TabsProps): React.JSX.Element {
  const tabsGroupId = useId();
  const firstEnabledTabId = tabs.find((t) => !t.disabled)?.id ?? tabs[0]?.id ?? "";

  const [uncontrolledValue, setUncontrolledValue] = useState<string>(
    defaultValue ?? firstEnabledTabId
  );

  const activeTabId = value !== undefined ? value : uncontrolledValue;

  const tabRefs = useRef<Map<string, HTMLButtonElement>>(new Map());

  const handleSelectTab = useCallback(
    (tabId: string) => {
      const target = tabs.find((t) => t.id === tabId);
      if (!target || target.disabled) return;

      if (value === undefined) {
        setUncontrolledValue(tabId);
      }
      onChange?.(tabId);
    },
    [tabs, value, onChange]
  );

  // Navigate focus between tabs
  const focusTabByIndex = useCallback(
    (index: number, shouldActivate: boolean) => {
      const enabledTabs = tabs.filter((t) => !t.disabled);
      if (enabledTabs.length === 0) return;

      // Wrap index
      const normalizedIndex =
        (index + enabledTabs.length) % enabledTabs.length;
      const targetTab = enabledTabs[normalizedIndex];
      if (!targetTab) return;

      const buttonNode = tabRefs.current.get(targetTab.id);
      if (buttonNode) {
        buttonNode.focus();
      }

      if (shouldActivate) {
        handleSelectTab(targetTab.id);
      }
    },
    [tabs, handleSelectTab]
  );

  const handleKeyDown = useCallback(
    (event: KeyboardEvent<HTMLDivElement>) => {
      const enabledTabs = tabs.filter((t) => !t.disabled);
      if (enabledTabs.length === 0) return;

      const activeIndex = enabledTabs.findIndex((t) => t.id === activeTabId);
      const isAuto = activationMode === "automatic";

      switch (event.key) {
        case "ArrowRight": {
          if (orientation === "horizontal") {
            event.preventDefault();
            focusTabByIndex(activeIndex + 1, isAuto);
          }
          break;
        }
        case "ArrowLeft": {
          if (orientation === "horizontal") {
            event.preventDefault();
            focusTabByIndex(activeIndex - 1, isAuto);
          }
          break;
        }
        case "ArrowDown": {
          if (orientation === "vertical") {
            event.preventDefault();
            focusTabByIndex(activeIndex + 1, isAuto);
          }
          break;
        }
        case "ArrowUp": {
          if (orientation === "vertical") {
            event.preventDefault();
            focusTabByIndex(activeIndex - 1, isAuto);
          }
          break;
        }
        case "Home": {
          event.preventDefault();
          focusTabByIndex(0, isAuto);
          break;
        }
        case "End": {
          event.preventDefault();
          focusTabByIndex(enabledTabs.length - 1, isAuto);
          break;
        }
        case "Enter":
        case " ": {
          // In manual mode, pressing Enter or Space on focused tab activates it
          if (activationMode === "manual") {
            const focusedElement = document.activeElement;
            const matchingTab = enabledTabs.find(
              (t) => tabRefs.current.get(t.id) === focusedElement
            );
            if (matchingTab) {
              event.preventDefault();
              handleSelectTab(matchingTab.id);
            }
          }
          break;
        }
        default:
          break;
      }
    },
    [tabs, activeTabId, activationMode, orientation, focusTabByIndex, handleSelectTab]
  );

  const isVertical = orientation === "vertical";

  return (
    <div
      className={`flex ${isVertical ? "flex-col sm:flex-row gap-4 sm:gap-6" : "flex-col gap-3 sm:gap-4"} ${className}`}
    >
      {/* Tablist container */}
      <div
        role="tablist"
        aria-label={ariaLabel}
        aria-orientation={orientation}
        onKeyDown={handleKeyDown}
        className={`flex ${
          isVertical
            ? "flex-col w-full sm:w-auto sm:min-w-[190px] p-1 sm:p-1.5 rounded-xl bg-muted/60 border border-border"
            : "flex-row flex-wrap sm:flex-nowrap items-center p-1 sm:p-1.5 rounded-xl bg-muted/60 border border-border overflow-x-auto max-w-full"
        } gap-1`}
      >
        {tabs.map((tab) => {
          const isSelected = tab.id === activeTabId;
          const tabButtonId = `tabs-${tabsGroupId}-tab-${tab.id}`;
          const tabPanelId = `tabs-${tabsGroupId}-panel-${tab.id}`;

          return (
            <button
              key={tab.id}
              ref={(node) => {
                if (node) {
                  tabRefs.current.set(tab.id, node);
                } else {
                  tabRefs.current.delete(tab.id);
                }
              }}
              id={tabButtonId}
              role="tab"
              type="button"
              tabIndex={isSelected ? 0 : -1}
              aria-selected={isSelected}
              aria-controls={tabPanelId}
              aria-disabled={tab.disabled ? "true" : undefined}
              disabled={tab.disabled}
              onClick={() => handleSelectTab(tab.id)}
              className={`relative inline-flex items-center justify-center font-medium text-xs sm:text-sm transition-all px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg select-none whitespace-nowrap ${
                isVertical ? "w-full text-left justify-start" : "flex-1 sm:flex-initial"
              } ${
                isSelected
                  ? "bg-background text-foreground shadow-sm font-semibold border border-border/50"
                  : "text-muted-foreground hover:text-foreground hover:bg-background/50"
              } ${
                tab.disabled
                  ? "opacity-40 cursor-not-allowed pointer-events-none"
                  : "cursor-pointer"
              } focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background`}
            >
              {tab.label}
              {isSelected && (
                <span
                  className="sr-only"
                  aria-hidden="true"
                >
                  (selected)
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Tabpanel containers */}
      <div className="flex-1 min-w-0">
        {tabs.map((tab) => {
          const isSelected = tab.id === activeTabId;
          const tabButtonId = `tabs-${tabsGroupId}-tab-${tab.id}`;
          const tabPanelId = `tabs-${tabsGroupId}-panel-${tab.id}`;

          return (
            <div
              key={tab.id}
              id={tabPanelId}
              role="tabpanel"
              tabIndex={0}
              aria-labelledby={tabButtonId}
              hidden={!isSelected}
              className={`p-4 sm:p-6 rounded-xl bg-card border border-border text-card-foreground shadow-xs transition-opacity focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background ${
                isSelected ? "block animate-in fade-in duration-150" : "hidden"
              }`}
            >
              {tab.content}
            </div>
          );
        })}
      </div>
    </div>
  );
}
