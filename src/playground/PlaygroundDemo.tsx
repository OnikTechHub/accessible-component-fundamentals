"use client";

import React, { useState, useEffect, useRef, type FormEvent } from "react";
import { Modal } from "./Modal";
import { Tabs, type TabItem } from "./Tabs";
import { Disclosure, DisclosureGroup } from "./Disclosure";

// Import shadcn components for side-by-side comparison
import {
  Dialog as ShadcnDialog,
  DialogContent as ShadcnDialogContent,
  DialogDescription as ShadcnDialogDescription,
  DialogFooter as ShadcnDialogFooter,
  DialogHeader as ShadcnDialogHeader,
  DialogTitle as ShadcnDialogTitle,
  DialogTrigger as ShadcnDialogTrigger,
} from "@/components/ui/dialog";
import {
  Tabs as ShadcnTabs,
  TabsContent as ShadcnTabsContent,
  TabsList as ShadcnTabsList,
  TabsTrigger as ShadcnTabsTrigger,
} from "@/components/ui/tabs";
import { Button as ShadcnButton } from "@/components/ui/button";

export function PlaygroundDemo(): React.JSX.Element {
  // Modal states
  const [isProfileModalOpen, setIsProfileModalOpen] = useState<boolean>(false);
  const [isAlertModalOpen, setIsAlertModalOpen] = useState<boolean>(false);
  const [isTermsModalOpen, setIsTermsModalOpen] = useState<boolean>(false);
  const [lastActionMessage, setLastActionMessage] = useState<string>(
    "Ready for keyboard testing. Press Tab to begin navigation."
  );

  // Tabs states
  const [tabsOrientation, setTabsOrientation] = useState<
    "horizontal" | "vertical"
  >("horizontal");
  const [tabsActivation, setTabsActivation] = useState<"automatic" | "manual">(
    "automatic"
  );
  const [selectedTabId, setSelectedTabId] = useState<string>("overview");

  // Disclosure states
  const [isControlledOpen, setIsControlledOpen] = useState<boolean>(false);

  // Live Focus & Key Telemetry
  const [focusedElementInfo, setFocusedElementInfo] = useState<string>("None");
  const [lastKeyInfo, setLastKeyInfo] = useState<string>("None");

  const profileInputRef = useRef<HTMLInputElement | null>(null);

  // Focus and Keydown monitor for telemetry bar
  useEffect(() => {
    const handleFocusIn = (e: FocusEvent) => {
      if (e.target instanceof HTMLElement) {
        const tag = e.target.tagName.toLowerCase();
        const role = e.target.getAttribute("role") ?? "none";
        const text = (
          e.target.innerText ||
          e.target.getAttribute("aria-label") ||
          e.target.getAttribute("id") ||
          tag
        )
          .slice(0, 24)
          .trim();
        setFocusedElementInfo(`<${tag}> role="${role}" [${text}]`);
      }
    };

    const handleGlobalKeyDown = (e: globalThis.KeyboardEvent) => {
      const keyCombo = [
        e.ctrlKey ? "Ctrl+" : "",
        e.altKey ? "Alt+" : "",
        e.shiftKey ? "Shift+" : "",
        e.key === " " ? "Space" : e.key,
      ].join("");
      setLastKeyInfo(keyCombo);
    };

    window.addEventListener("focusin", handleFocusIn);
    window.addEventListener("keydown", handleGlobalKeyDown);
    return () => {
      window.removeEventListener("focusin", handleFocusIn);
      window.removeEventListener("keydown", handleGlobalKeyDown);
    };
  }, []);

  const handleProfileSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsProfileModalOpen(false);
    setLastActionMessage("Profile updated successfully!");
  };

  const sampleTabs: TabItem[] = [
    {
      id: "overview",
      label: "Overview",
      content: (
        <div className="space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h4 className="font-semibold text-foreground text-sm sm:text-base">
              System Architecture & Health
            </h4>
            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
              Optimal
            </span>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
            All sub-systems are operating within nominal parameters. Roving
            focus is currently active: navigate across tabs using{" "}
            <kbd className="px-1.5 py-0.5 text-xs font-mono bg-muted rounded border border-border">
              ArrowRight
            </kbd>{" "}
            and{" "}
            <kbd className="px-1.5 py-0.5 text-xs font-mono bg-muted rounded border border-border">
              ArrowLeft
            </kbd>
            .
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-3 pt-2">
            <div className="p-3 rounded-lg bg-muted/40 border border-border">
              <div className="text-xs text-muted-foreground">Uptime</div>
              <div className="text-base sm:text-lg font-bold text-foreground">99.98%</div>
            </div>
            <div className="p-3 rounded-lg bg-muted/40 border border-border">
              <div className="text-xs text-muted-foreground">Latency</div>
              <div className="text-base sm:text-lg font-bold text-foreground">18ms</div>
            </div>
            <div className="p-3 rounded-lg bg-muted/40 border border-border">
              <div className="text-xs text-muted-foreground">Active Nodes</div>
              <div className="text-base sm:text-lg font-bold text-foreground">12 / 12</div>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: "analytics",
      label: "Analytics",
      content: (
        <div className="space-y-3">
          <h4 className="font-semibold text-foreground text-sm sm:text-base">
            Telemetry & APG Metrics
          </h4>
          <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
            Tab panel contents are natively reachable via keyboard. Pressing{" "}
            <kbd className="px-1.5 py-0.5 text-xs font-mono bg-muted rounded border border-border">
              Tab
            </kbd>{" "}
            moves focus from the active tab trigger into the tabpanel container (
            <code>tabIndex=0</code>), allowing screen readers and keyboard users
            to read or scroll easily.
          </p>
          <div className="p-3 sm:p-4 rounded-lg bg-muted/30 border border-dashed border-border font-mono text-[11px] sm:text-xs text-foreground/80 space-y-1 overflow-x-auto">
            <div>• aria-selected: true (on active tab)</div>
            <div>• aria-controls: matching tabpanel ID</div>
            <div>• aria-labelledby: matching tab button ID</div>
            <div>• roving tabIndex: 0 on active tab, -1 on inactive</div>
          </div>
        </div>
      ),
    },
    {
      id: "disabled",
      label: "Audit Log (Disabled)",
      disabled: true,
      content: <div>Disabled tab panel</div>,
    },
    {
      id: "settings",
      label: "Accessibility Settings",
      content: (
        <div className="space-y-4">
          <h4 className="font-semibold text-foreground text-sm sm:text-base">
            Tab Configuration Controls
          </h4>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Configure how keyboard navigation behaves across this tablist:
          </p>
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 pt-1">
            <button
              type="button"
              onClick={() =>
                setTabsActivation((prev) =>
                  prev === "automatic" ? "manual" : "automatic"
                )
              }
              className="inline-flex items-center justify-center gap-2 px-3 py-2 text-xs font-medium rounded-lg bg-secondary text-secondary-foreground hover:bg-secondary/80 border border-border focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              Mode:{" "}
              <strong className="underline uppercase tracking-wide">
                {tabsActivation}
              </strong>
            </button>
            <button
              type="button"
              onClick={() =>
                setTabsOrientation((prev) =>
                  prev === "horizontal" ? "vertical" : "horizontal"
                )
              }
              className="inline-flex items-center justify-center gap-2 px-3 py-2 text-xs font-medium rounded-lg bg-secondary text-secondary-foreground hover:bg-secondary/80 border border-border focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              Orientation:{" "}
              <strong className="underline uppercase tracking-wide">
                {tabsOrientation}
              </strong>
            </button>
          </div>
        </div>
      ),
    },
  ];

  return (
    <div className="w-full max-w-7xl mx-auto px-3.5 py-6 sm:px-6 sm:py-8 lg:px-8 space-y-8 sm:space-y-10">
      {/* Top Banner / Header */}
      <header className="space-y-4 border-b border-border pb-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20 mb-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              FE-03 Assignment Showcase
            </div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight text-foreground leading-tight">
              Accessible Component Fundamentals
            </h1>
            <p className="text-sm sm:text-base text-muted-foreground mt-1 max-w-3xl leading-relaxed">
              Strict W3C ARIA Authoring Practices Guide (APG) implementations
              built from scratch in React, TypeScript, and Tailwind CSS. Zero
              third-party runtime component libraries used for scratch
              components.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
            <span className="px-2.5 py-1 rounded-md text-[11px] sm:text-xs font-medium bg-muted border border-border text-foreground">
              TypeScript Strict (0 any)
            </span>
            <span className="px-2.5 py-1 rounded-md text-[11px] sm:text-xs font-medium bg-muted border border-border text-foreground">
              W3C APG Compliant
            </span>
            <span className="px-2.5 py-1 rounded-md text-[11px] sm:text-xs font-medium bg-muted border border-border text-foreground">
              shadcn/ui Included
            </span>
          </div>
        </div>

        {/* Live Keyboard & Focus Telemetry Bar */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5 sm:gap-3 p-3 sm:p-3.5 rounded-xl bg-card border border-border shadow-xs text-xs">
          <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 min-w-0">
            <span className="text-muted-foreground font-medium shrink-0">
              Active Focus Target:
            </span>
            <span className="font-mono text-primary font-semibold truncate bg-muted/60 px-2 py-0.5 rounded border border-border/60 block">
              {focusedElementInfo}
            </span>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 min-w-0">
            <span className="text-muted-foreground font-medium shrink-0">
              Last Key Detected:
            </span>
            <span className="font-mono text-emerald-600 dark:text-emerald-400 font-bold bg-muted/60 px-2 py-0.5 rounded border border-border/60 block">
              {lastKeyInfo}
            </span>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 min-w-0">
            <span className="text-muted-foreground font-medium shrink-0">
              Status:
            </span>
            <span className="text-muted-foreground truncate block">
              {lastActionMessage}
            </span>
          </div>
        </div>
      </header>

      {/* Keyboard Shortcut Cheat-Sheet */}
      <section
        aria-labelledby="cheat-sheet-heading"
        className="rounded-xl border border-border bg-card p-4 sm:p-5 shadow-xs space-y-4"
      >
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2
            id="cheat-sheet-heading"
            className="text-base sm:text-lg font-bold text-foreground flex items-center gap-2"
          >
            <svg
              className="w-5 h-5 text-primary shrink-0"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            Keyboard-Only Testing Protocol & Shortcut Cheat-Sheet
          </h2>
          <span className="text-xs text-muted-foreground font-medium">
            Test unplugged from mouse
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3">
          <div className="p-3.5 rounded-xl bg-muted/30 border border-border space-y-1.5">
            <div className="flex items-center gap-1.5">
              <kbd className="px-2 py-1 text-xs font-mono font-bold bg-background rounded-md border border-border shadow-2xs text-foreground">
                Tab
              </kbd>
              <span className="text-xs text-muted-foreground font-medium">/</span>
              <kbd className="px-2 py-1 text-xs font-mono font-bold bg-background rounded-md border border-border shadow-2xs text-foreground">
                Shift+Tab
              </kbd>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed pt-0.5">
              Forward and backward focus cycling. Trapped strictly inside open
              modal dialogs.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-muted/30 border border-border space-y-1.5">
            <div className="flex items-center gap-1.5">
              <kbd className="px-2 py-1 text-xs font-mono font-bold bg-background rounded-md border border-border shadow-2xs text-foreground">
                Escape
              </kbd>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed pt-0.5">
              Instantly dismisses modal dialogs and restores focus precisely
              back to the trigger button.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-muted/30 border border-border space-y-1.5">
            <div className="flex items-center gap-1.5">
              <kbd className="px-2 py-1 text-xs font-mono font-bold bg-background rounded-md border border-border shadow-2xs text-foreground">
                ←
              </kbd>
              <kbd className="px-2 py-1 text-xs font-mono font-bold bg-background rounded-md border border-border shadow-2xs text-foreground">
                →
              </kbd>
              <span className="text-xs text-muted-foreground font-medium">/</span>
              <kbd className="px-2 py-1 text-xs font-mono font-bold bg-background rounded-md border border-border shadow-2xs text-foreground">
                Home
              </kbd>
              <kbd className="px-2 py-1 text-xs font-mono font-bold bg-background rounded-md border border-border shadow-2xs text-foreground">
                End
              </kbd>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed pt-0.5">
              Roving tabindex navigation across tabs. Loops cleanly between
              first and last enabled tab.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-muted/30 border border-border space-y-1.5">
            <div className="flex items-center gap-1.5">
              <kbd className="px-2 py-1 text-xs font-mono font-bold bg-background rounded-md border border-border shadow-2xs text-foreground">
                Enter
              </kbd>
              <span className="text-xs text-muted-foreground font-medium">/</span>
              <kbd className="px-2 py-1 text-xs font-mono font-bold bg-background rounded-md border border-border shadow-2xs text-foreground">
                Space
              </kbd>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed pt-0.5">
              Toggles disclosure panel expand/collapse and activates tabs under
              manual activation mode.
            </p>
          </div>
        </div>
      </section>

      {/* COMPONENT 1: MODAL DIALOG */}
      <section
        aria-labelledby="modal-section-heading"
        className="rounded-2xl border border-border bg-card p-4 sm:p-6 shadow-sm space-y-6"
      >
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-border pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-primary">
                Component 1
              </span>
              <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                W3C APG Dialog (Modal)
              </span>
            </div>
            <h2
              id="modal-section-heading"
              className="text-xl sm:text-2xl font-bold tracking-tight text-foreground mt-1"
            >
              Custom Accessible Modal Dialog
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground mt-1 leading-relaxed">
              Demonstrates focus trapping, return focus restoration, Escape key
              handling, backdrop scroll locking, and screen reader labels.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center gap-2 w-full lg:w-auto">
            <button
              type="button"
              onClick={() => setIsProfileModalOpen(true)}
              className="w-full sm:w-auto inline-flex items-center justify-center px-4 py-2 text-xs sm:text-sm font-semibold rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition shadow-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              Open Form Dialog
            </button>
            <button
              type="button"
              onClick={() => setIsAlertModalOpen(true)}
              className="w-full sm:w-auto inline-flex items-center justify-center px-4 py-2 text-xs sm:text-sm font-semibold rounded-lg bg-destructive text-destructive-foreground hover:bg-destructive/90 transition shadow-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              Open Alert Dialog
            </button>
            <button
              type="button"
              onClick={() => setIsTermsModalOpen(true)}
              className="w-full sm:w-auto inline-flex items-center justify-center px-4 py-2 text-xs sm:text-sm font-semibold rounded-lg bg-secondary text-secondary-foreground hover:bg-secondary/80 border border-border transition shadow-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              Open Scrollable Modal
            </button>
          </div>
        </div>

        {/* Modal Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4 text-xs">
          <div className="p-4 rounded-xl bg-muted/30 border border-border space-y-1.5">
            <div className="font-semibold text-foreground flex items-center gap-1.5">
              <span className="text-emerald-500">✓</span> Focus Management
            </div>
            <p className="text-muted-foreground leading-relaxed">
              Upon open, focus moves immediately to the first interactive input
              (or designated <code>initialFocusRef</code>). When closed via
              Escape or button, focus returns to the exact opener button.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-muted/30 border border-border space-y-1.5">
            <div className="font-semibold text-foreground flex items-center gap-1.5">
              <span className="text-emerald-500">✓</span> Tab Cycling Focus Trap
            </div>
            <p className="text-muted-foreground leading-relaxed">
              Pressing Tab on the last element cycles to the first; Shift+Tab on
              the first cycles to the last. Focus never escapes into background
              DOM while open.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-muted/30 border border-border space-y-1.5">
            <div className="font-semibold text-foreground flex items-center gap-1.5">
              <span className="text-emerald-500">✓</span> Body Scroll Lock
            </div>
            <p className="text-muted-foreground leading-relaxed">
              Background scroll is locked with automatic scrollbar width
              compensation to prevent page layout shift during dialog
              interaction.
            </p>
          </div>
        </div>

        {/* Side-by-Side Comparison: Scratch Modal vs shadcn/ui Dialog */}
        <div className="p-3.5 sm:p-5 rounded-xl bg-muted/20 border border-dashed border-border space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="font-semibold text-xs sm:text-sm text-foreground">
              Direct Side-by-Side Verification: Compare with shadcn/ui Dialog
            </span>
            <span className="text-[11px] sm:text-xs text-muted-foreground font-mono">
              @base-ui/react primitive
            </span>
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Test opening our custom scratch modal alongside shadcn&apos;s
            pre-built dialog to feel the exact accessibility parity in focus
            movement and escape handling:
          </p>
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
            <ShadcnDialog>
              <ShadcnDialogTrigger
                render={
                  <ShadcnButton variant="outline" size="sm" className="w-full sm:w-auto">
                    Launch shadcn/ui Dialog
                  </ShadcnButton>
                }
              />
              <ShadcnDialogContent>
                <ShadcnDialogHeader>
                  <ShadcnDialogTitle>shadcn/ui Dialog Comparison</ShadcnDialogTitle>
                  <ShadcnDialogDescription>
                    This dialog is rendered by shadcn/ui (powered by Base UI).
                    Notice the backdrop overlay, focus trapping, and Escape key
                    dismissal.
                  </ShadcnDialogDescription>
                </ShadcnDialogHeader>
                <div className="space-y-3 py-2 text-xs text-muted-foreground">
                  <p>
                    shadcn/ui encapsulates portal rendering, background tree
                    inertness, and focus layers under its headless primitive.
                  </p>
                  <input
                    type="text"
                    placeholder="Focusable test input"
                    className="w-full px-3 py-1.5 rounded border border-border text-xs bg-background text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  />
                </div>
                <ShadcnDialogFooter>
                  <ShadcnButton size="sm">Acknowledge</ShadcnButton>
                </ShadcnDialogFooter>
              </ShadcnDialogContent>
            </ShadcnDialog>

            <span className="text-xs text-muted-foreground">
              (Use Tab to test keyboard trap in both dialogs)
            </span>
          </div>
        </div>
      </section>

      {/* COMPONENT 2: ACCESSIBLE TABS */}
      <section
        aria-labelledby="tabs-section-heading"
        className="rounded-2xl border border-border bg-card p-4 sm:p-6 shadow-sm space-y-6"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-primary">
                Component 2
              </span>
              <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                W3C APG Tabs Pattern
              </span>
            </div>
            <h2
              id="tabs-section-heading"
              className="text-xl sm:text-2xl font-bold tracking-tight text-foreground mt-1"
            >
              Custom Accessible Tabs
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground mt-1 leading-relaxed">
              Implements roving tabindex (<code>tabIndex=0</code> on active tab,{" "}
              <code>tabIndex=-1</code> on others), arrow key navigation, Home/End
              shortcuts, and accessible tabpanels.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-muted-foreground">
              Active Tab ID:
            </span>
            <code className="px-2 py-1 rounded bg-muted text-xs font-mono font-semibold text-primary border border-border">
              {selectedTabId}
            </code>
          </div>
        </div>

        {/* Scratch Tabs Instance */}
        <div className="space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground">
            <span>
              Orientation: <strong>{tabsOrientation}</strong> | Activation:{" "}
              <strong>{tabsActivation}</strong>
            </span>
            <span>
              Navigate with <strong>Arrow keys</strong>. Jump with{" "}
              <strong>Home</strong> / <strong>End</strong>.
            </span>
          </div>

          <Tabs
            tabs={sampleTabs}
            value={selectedTabId}
            onChange={(id) => {
              setSelectedTabId(id);
              setLastActionMessage(`Switched to tab: ${id}`);
            }}
            orientation={tabsOrientation}
            activationMode={tabsActivation}
            ariaLabel="System Management Dashboard"
          />
        </div>

        {/* Side-by-Side Comparison: Scratch Tabs vs shadcn/ui Tabs */}
        <div className="p-3.5 sm:p-5 rounded-xl bg-muted/20 border border-dashed border-border space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="font-semibold text-xs sm:text-sm text-foreground">
              Direct Side-by-Side Verification: Compare with shadcn/ui Tabs
            </span>
            <span className="text-[11px] sm:text-xs text-muted-foreground font-mono">
              @base-ui/react primitive
            </span>
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Test keyboard arrow navigation on shadcn&apos;s tabs implementation
            below:
          </p>
          <ShadcnTabs defaultValue="account" className="w-full">
            <ShadcnTabsList className="max-w-full overflow-x-auto">
              <ShadcnTabsTrigger value="account">Account</ShadcnTabsTrigger>
              <ShadcnTabsTrigger value="password">Password</ShadcnTabsTrigger>
              <ShadcnTabsTrigger value="notifications">Notifications</ShadcnTabsTrigger>
            </ShadcnTabsList>
            <ShadcnTabsContent
              value="account"
              className="p-4 rounded-lg bg-card border border-border text-xs text-muted-foreground"
            >
              Account settings panel rendered by shadcn/ui tabs primitive.
            </ShadcnTabsContent>
            <ShadcnTabsContent
              value="password"
              className="p-4 rounded-lg bg-card border border-border text-xs text-muted-foreground"
            >
              Password change panel rendered by shadcn/ui tabs primitive.
            </ShadcnTabsContent>
            <ShadcnTabsContent
              value="notifications"
              className="p-4 rounded-lg bg-card border border-border text-xs text-muted-foreground"
            >
              Notification preferences panel rendered by shadcn/ui tabs
              primitive.
            </ShadcnTabsContent>
          </ShadcnTabs>
        </div>
      </section>

      {/* COMPONENT 3: ACCESSIBLE DISCLOSURE */}
      <section
        aria-labelledby="disclosure-section-heading"
        className="rounded-2xl border border-border bg-card p-4 sm:p-6 shadow-sm space-y-6"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-primary">
                Component 3
              </span>
              <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                W3C APG Disclosure Pattern
              </span>
            </div>
            <h2
              id="disclosure-section-heading"
              className="text-xl sm:text-2xl font-bold tracking-tight text-foreground mt-1"
            >
              Custom Accessible Disclosure
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground mt-1 leading-relaxed">
              Collapsible panels with linked <code>aria-expanded</code> and{" "}
              <code>aria-controls</code> states. Toggles smoothly with Enter or
              Space keys.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsControlledOpen((prev) => !prev)}
              className="w-full sm:w-auto px-3.5 py-2 text-xs font-semibold rounded-lg bg-secondary text-secondary-foreground hover:bg-secondary/80 border border-border transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              External Toggle: {isControlledOpen ? "Collapse" : "Expand"}
            </button>
          </div>
        </div>

        <DisclosureGroup>
          <Disclosure
            title="What is the W3C ARIA Authoring Practices Guide (APG)?"
            badge="Standard"
            defaultOpen={true}
          >
            <p className="leading-relaxed">
              The W3C ARIA Authoring Practices Guide provides authoritative
              recommendations and code patterns for implementing accessible web
              widgets. It specifies the expected semantic roles, states,
              properties, and keyboard interactions required for full screen
              reader and assistive technology compatibility.
            </p>
          </Disclosure>

          <Disclosure
            title="How does focus trapping prevent keyboard trap violations?"
            badge="Security & A11y"
          >
            <p className="leading-relaxed">
              WCAG 2.1 Success Criterion 2.1.2 (No Keyboard Trap) requires that
              keyboard focus can exit any component using standard keys. For
              modal dialogs, focus trapping must be bounded strictly inside the
              dialog while open, but pressing the Escape key or activating a
              close button must immediately release focus and return it to the
              originating trigger.
            </p>
          </Disclosure>

          <Disclosure
            title="Controlled Disclosure Example (Connected to External State)"
            isOpen={isControlledOpen}
            onToggle={(open) => setIsControlledOpen(open)}
            badge="Controlled"
          >
            <p className="leading-relaxed">
              This disclosure is in controlled mode. Its expansion state is
              managed by parent React state, allowing external buttons (or forms)
              to toggle it while keeping ARIA attributes (
              <code>aria-expanded=&quot;{isControlledOpen ? "true" : "false"}&quot;</code>
              ) completely synchronized.
            </p>
          </Disclosure>

          <Disclosure
            title="Disabled Disclosure Item"
            disabled={true}
            badge="Disabled"
          >
            <p>This content cannot be expanded because the item is disabled.</p>
          </Disclosure>
        </DisclosureGroup>
      </section>

      {/* MODAL INSTANCES */}

      {/* 1. Profile Edit Form Modal */}
      <Modal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        title="Edit User Profile"
        description="Update your account details below. Focus is trapped inside this dialog until closed."
        initialFocusRef={profileInputRef}
        size="md"
        footer={
          <>
            <button
              type="button"
              onClick={() => setIsProfileModalOpen(false)}
              className="w-full sm:w-auto px-4 py-2 text-xs sm:text-sm font-medium rounded-lg bg-secondary text-secondary-foreground hover:bg-secondary/80 border border-border transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              Cancel
            </button>
            <button
              type="submit"
              form="profile-form"
              className="w-full sm:w-auto px-4 py-2 text-xs sm:text-sm font-semibold rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition shadow-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              Save Changes
            </button>
          </>
        }
      >
        <form
          id="profile-form"
          onSubmit={handleProfileSubmit}
          className="space-y-4"
        >
          <div>
            <label
              htmlFor="profile-name-input"
              className="block text-xs font-semibold text-foreground mb-1"
            >
              Full Name (Initial Focus)
            </label>
            <input
              ref={profileInputRef}
              id="profile-name-input"
              type="text"
              defaultValue="Alex Mercer"
              required
              className="w-full px-3 py-2 rounded-lg bg-background border border-border text-foreground text-xs sm:text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
          </div>

          <div>
            <label
              htmlFor="profile-email-input"
              className="block text-xs font-semibold text-foreground mb-1"
            >
              Email Address
            </label>
            <input
              id="profile-email-input"
              type="email"
              defaultValue="alex.mercer@example.com"
              required
              className="w-full px-3 py-2 rounded-lg bg-background border border-border text-foreground text-xs sm:text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
          </div>

          <div>
            <label
              htmlFor="profile-role-select"
              className="block text-xs font-semibold text-foreground mb-1"
            >
              Department Role
            </label>
            <select
              id="profile-role-select"
              defaultValue="engineer"
              className="w-full px-3 py-2 rounded-lg bg-background border border-border text-foreground text-xs sm:text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <option value="engineer">Lead Frontend Engineer</option>
              <option value="designer">Accessibility Specialist</option>
              <option value="qa">Quality Assurance Analyst</option>
            </select>
          </div>
        </form>
      </Modal>

      {/* 2. Alert Confirmation Modal */}
      <Modal
        isOpen={isAlertModalOpen}
        onClose={() => setIsAlertModalOpen(false)}
        role="alertdialog"
        title="Delete Cloud Deployment?"
        description="This action cannot be undone. All provisioned instances will be permanently terminated."
        size="sm"
        footer={
          <>
            <button
              type="button"
              onClick={() => setIsAlertModalOpen(false)}
              className="w-full sm:w-auto px-4 py-2 text-xs sm:text-sm font-medium rounded-lg bg-secondary text-secondary-foreground hover:bg-secondary/80 border border-border transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => {
                setIsAlertModalOpen(false);
                setLastActionMessage("Deployment deletion confirmed.");
              }}
              className="w-full sm:w-auto px-4 py-2 text-xs sm:text-sm font-semibold rounded-lg bg-destructive text-destructive-foreground hover:bg-destructive/90 transition shadow-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              Confirm Delete
            </button>
          </>
        }
      >
        <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-xs text-destructive flex items-start gap-2.5">
          <svg
            className="w-5 h-5 shrink-0"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
          <span className="leading-relaxed">
            <code>role=&quot;alertdialog&quot;</code> communicates high-urgency
            interruptions directly to screen reader speech synthesizers.
          </span>
        </div>
      </Modal>

      {/* 3. Scrollable Terms Modal */}
      <Modal
        isOpen={isTermsModalOpen}
        onClose={() => setIsTermsModalOpen(false)}
        title="Terms of Service & Licensing"
        description="Verifies background body scroll lock and inner modal scrolling."
        size="lg"
        footer={
          <button
            type="button"
            onClick={() => setIsTermsModalOpen(false)}
            className="w-full sm:w-auto px-4 py-2 text-xs sm:text-sm font-semibold rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition shadow-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            I Agree
          </button>
        }
      >
        <div className="space-y-4 max-h-60 overflow-y-auto pr-2 text-xs leading-relaxed text-muted-foreground border p-3 rounded-lg bg-muted/20">
          <p>
            1. Scope of Accessibility: All components must strictly follow WCAG
            2.1 AA and W3C ARIA Authoring Practices Guide (APG) standards.
          </p>
          <p>
            2. Focus Management: Any dynamic dialog must explicitly transfer
            input focus into its interactive tree upon mounting, trap Tab and
            Shift+Tab traversal without letting focus leak into the background
            document, and return focus to the exact originating trigger upon
            dismissal.
          </p>
          <p>
            3. Roving TabIndex: Tablists must manage active item focus such that
            only the currently selected tab possesses <code>tabindex=&quot;0&quot;</code>,
            while all inactive siblings possess <code>tabindex=&quot;-1&quot;</code>.
          </p>
          <p>
            4. Keyboard Bindings: Left and Right arrow keys cycle horizontal
            tabs; Home and End jump to extremities; Enter and Space toggle
            disclosures and activate manual tabs.
          </p>
          <p>
            5. Scroll Locking: When modals are active, the outer body element
            must suppress viewport scrolling to prevent confusing user
            displacement.
          </p>
        </div>
      </Modal>
    </div>
  );
}
