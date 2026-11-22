# FE-03: Accessible Component Fundamentals
## Comprehensive Architecture, Accessibility & Comparative Analysis

---

### Table of Contents
1. [Project Overview & Architectural Objectives](#1-project-overview--architectural-objectives)
2. [Component Implementations & W3C ARIA Compliance](#2-component-implementations--w3c-aria-compliance)
   - [Modal Dialog (`playground/Modal.tsx`)](#modal-dialog-playgroundmodaltsx)
   - [Tabs Component (`playground/Tabs.tsx`)](#tabs-component-playgroundtabstsx)
   - [Disclosure Component (`playground/Disclosure.tsx`)](#disclosure-component-playgrounddisclosuretsx)
3. [Deep Technical Gap Analysis: Custom Scratch vs. shadcn/ui (Radix / Base UI)](#3-deep-technical-gap-analysis-custom-scratch-vs-shadcnui-radix--base-ui)
   - [Gap 1: Background Tree Suppression (`inert` & `aria-hidden` vs. Pure Event Interception)](#gap-1-background-tree-suppression-inert--aria-hidden-vs-pure-event-interception)
   - [Gap 2: Nested Modal Stacking & Hierarchical Focus Layers](#gap-2-nested-modal-stacking--hierarchical-focus-layers)
   - [Gap 3: Portal Teleportation & Stacking Context Traps](#gap-3-portal-teleportation--stacking-context-traps)
   - [Gap 4: Bidirectional Navigation & RTL (Right-to-Left) Mechanics in Tabs](#gap-4-bidirectional-navigation--rtl-right-to-left-mechanics-in-tabs)
   - [Gap 5: Assistive Tech Announcement Edge Cases & Virtual Cursors](#gap-5-assistive-tech-announcement-edge-cases--virtual-cursors)
4. [Keyboard-Only Testing Protocol & Key Takeaways](#4-keyboard-only-testing-protocol--key-takeaways)
5. [TypeScript Architecture & Zero-Escape Policy](#5-typescript-architecture--zero-escape-policy)
6. [Conclusion & Production Recommendations](#6-conclusion--production-recommendations)

---

### 1. Project Overview & Architectural Objectives

The **FE-03: Accessible Component Fundamentals** project demonstrates foundational web accessibility (a11y) engineering by implementing three ubiquitous interactive UI patterns from scratch in React, TypeScript, and Tailwind CSS without third-party component libraries:
1. **Modal Dialog (`Modal.tsx`)**
2. **Tabs (`Tabs.tsx`)**
3. **Disclosure (`Disclosure.tsx`)**

Each component strictly adheres to the **W3C Web Accessibility Initiative (WAI) Accessible Rich Internet Applications (ARIA) Authoring Practices Guide (APG)**. Alongside these scratch implementations, `shadcn/ui` components (`dialog` and `tabs`) were integrated into the repository to serve as a benchmark for production-grade headless primitives.

---

### 2. Component Implementations & W3C ARIA Compliance

#### Modal Dialog (`playground/Modal.tsx`)
- **Semantic ARIA Roles & Attributes**:
  - `role="dialog"` (or `role="alertdialog"` for urgent confirmations).
  - `aria-modal="true"` to communicate to accessibility APIs that content outside the dialog container is inert.
  - `aria-labelledby="modal-title-[id]"` dynamically bound to the primary heading.
  - `aria-describedby="modal-desc-[id]"` optionally bound to secondary explanatory copy.
- **Focus Management & Focus Trapping**:
  - **Mount/Open**: Caches `document.activeElement` into `previousActiveElementRef`. Automatically transfers focus inside the dialog using `requestAnimationFrame`: prioritizing `initialFocusRef` if specified, followed by the first visible, non-disabled focusable element, or the modal container (`tabIndex={-1}`) if no interactive children exist.
  - **Focus Trap**: Intercepts `Tab` and `Shift + Tab` keydown events. Queries all focusable DOM elements within the container. If navigating forward on the last element, focus cycles to the first element; if navigating backward with `Shift + Tab` on the first element, focus cycles to the last element.
  - **Unmount/Close**: Automatically restores focus back to the exact trigger element that opened the modal.
- **Keyboard & Viewport Handlers**:
  - `Escape` key immediately closes the dialog and restores focus.
  - Backdrop click detector distinguishes between intentional backdrop clicks and mouse drags originating inside the dialog content.
  - Background body scroll locking (`overflow = "hidden"`) with scrollbar width compensation prevents layout shift.

#### Tabs Component (`playground/Tabs.tsx`)
- **Semantic ARIA Roles & Attributes**:
  - `role="tablist"` wrapper with configurable `aria-label` and `aria-orientation="horizontal" | "vertical"`.
  - `role="tab"` buttons with unique IDs (`tabs-[groupId]-tab-[id]`), `aria-controls="tabs-[groupId]-panel-[id]"`, and `aria-selected="true" | "false"`.
  - Roving `tabIndex`: The currently active tab button receives `tabIndex={0}`, while all inactive sibling tabs receive `tabIndex={-1}`.
  - `role="tabpanel"` containers with `id="tabs-[groupId]-panel-[id]"`, `aria-labelledby="tabs-[groupId]-tab-[id]"`, and `tabIndex={0}` to allow keyboard users to scroll panel content when no interactive children are present.
- **Keyboard Navigation**:
  - `ArrowRight` / `ArrowLeft`: Moves focus across horizontal tabs with automatic wrapping (looping between first and last enabled tabs).
  - `ArrowDown` / `ArrowUp`: Moves focus across vertical tabs with automatic wrapping.
  - `Home`: Immediately jumps focus to the first enabled tab.
  - `End`: Immediately jumps focus to the last enabled tab.
  - **Activation Modes**:
    - `automatic` (default): Moving focus with arrow keys immediately selects and renders the tab.
    - `manual`: Moving focus with arrow keys changes roving focus; pressing `Enter` or `Space` activates the tab.

#### Disclosure Component (`playground/Disclosure.tsx`)
- **Semantic ARIA Roles & Attributes**:
  - Trigger `<button>` element with `type="button"`, `aria-expanded="true" | "false"`, and `aria-controls="disclosure-[id]-panel"`.
  - Panel container with `id="disclosure-[id]-panel"`, `role="region"`, `aria-labelledby="disclosure-[id]-trigger"`, and `hidden={!isExpanded}`.
- **Keyboard Support**:
  - Standard button activation on `Enter` and `Space`. Explicit `onKeyDown` handler suppresses default browser window scrolling when activating via `Space`.
  - Visible high-contrast focus rings (`focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2`).
  - Supports controlled (`isOpen`, `onToggle`) and uncontrolled (`defaultOpen`) state paradigms.

---

### 3. Deep Technical Gap Analysis: Custom Scratch vs. shadcn/ui (Radix / Base UI)

While our custom scratch implementations achieve strict compliance with basic APG requirements, production-grade headless libraries like `shadcn/ui` (built on Radix Primitives / `@base-ui/react`) solve subtle, high-impact edge cases. Here is an honest technical breakdown of five major gaps:

```
┌──────────────────────────────────────┬───────────────────────────────┬──────────────────────────────────┐
│ Architectural Capability             │ Custom Scratch Implementation │ shadcn / Radix / Base UI         │
├──────────────────────────────────────┼───────────────────────────────┼──────────────────────────────────┤
│ Screen Reader Background Isolation   │ Pure Tab key trapping         │ HTML inert / aria-hidden tree    │
│ Nested Dialog Stacking               │ Single modal assumption       │ Centralized FocusScope Stack     │
│ CSS Stacking Context Escaping        │ createPortal to document.body │ Teleport + collision & cleanup   │
│ Bidirectional RTL in Tabs            │ LTR fixed ArrowRight/Left     │ Automatic dir="rtl" inversion    │
│ Assistive Tech Announcements         │ Static ARIA states            │ aria-live polite sync            │
└──────────────────────────────────────┴───────────────────────────────┴──────────────────────────────────┘
```

#### Gap 1: Background Tree Suppression (`inert` & `aria-hidden` vs. Pure Event Interception)
* **What Our Scratch Version Did**:
  Our scratch modal intercepts `Tab` and `Shift + Tab` `keydown` events in JavaScript. If focus attempts to leave the modal bounds, our handler prevents the default event and forces focus back to the opposite end of the modal.
* **Why This Is Insufficient for Screen Readers**:
  Screen reader users (e.g., NVDA, JAWS, VoiceOver) do not navigate solely via `Tab`. They frequently utilize **virtual browse mode** or the **VoiceOver Rotor** (e.g., navigating by headings `H`, paragraphs `P`, links `K`, or swiping on mobile). Because DOM nodes outside the modal remain part of the accessibility tree, a screen reader user can navigate straight out of the visual modal and read background content beneath the backdrop!
* **How shadcn / Radix Handles It**:
  Radix Primitives utilize packages like `aria-hidden` or the native browser `inert` attribute. When a dialog opens, the primitive walks sibling root nodes and applies `aria-hidden="true"` or `inert` to everything outside the modal container. This completely removes the background page from assistive technology trees, guaranteeing that VoiceOver or NVDA cannot navigate into background content.

#### Gap 2: Nested Modal Stacking & Hierarchical Focus Layers
* **What Our Scratch Version Did**:
  Our scratch modal assumes a single modal dialog is open at any given time. It registers global window listeners for `keydown` (Escape and Tab).
* **The Failure Mode in Complex UIs**:
  If a user opens a Modal, and within that modal triggers a confirmation `AlertDialog`, or opens a `<select>` / popover / date-picker:
  1. Both dialogs would listen to the `Escape` key. Pressing `Escape` would close *both* the confirmation dialog and the underlying modal simultaneously!
  2. Focus trapping would conflict: both traps would attempt to restrict focus to their respective containers.
  3. Closing the top-most dialog would risk restoring focus to an element that no longer exists or misplace the focus target.
* **How shadcn / Radix Handles It**:
  Radix and Base UI implement a centralized **`FocusScope` stack manager** and layered dismissal architecture:
  - Each layer is registered in a singleton stack.
  - Global events (such as `Escape` or outside pointer clicks) are dispatched only to the topmost layer.
  - When the top layer dismisses, it returns focus to the trigger inside the preceding modal layer, maintaining a stable hierarchy.

#### Gap 3: Portal Teleportation & Stacking Context Traps
* **What Our Scratch Version Did**:
  Our scratch modal renders using `createPortal(..., document.body)`.
* **Subtle Production Edge Cases**:
  - **Z-Index and Stacking Contexts**: If a parent container in the DOM tree has CSS properties like `transform`, `filter`, `perspective`, or `clip-path`, child fixed-position elements can become trapped inside the parent's local coordinate space. While rendering into `document.body` solves this for standard dialogs, applications with multiple scroll containers, iframe sandboxes, or micro-frontends require container-specific portal targeting.
  - **Scrollbar Shifting**: Our scratch implementation manually reads `window.innerWidth - document.documentElement.clientWidth` and sets `paddingRight`. Headless libraries use dedicated layout utilities (e.g. `react-remove-scroll`) that handle touch scrolling locks on iOS Safari, virtual keyboard appearance on mobile viewports, and pinch-to-zoom isolation.

#### Gap 4: Bidirectional Navigation & RTL (Right-to-Left) Mechanics in Tabs
* **What Our Scratch Version Did**:
  In `Tabs.tsx`, pressing `ArrowRight` always increments the tab index (`index + 1`), and `ArrowLeft` always decrements (`index - 1`).
* **The Internationalization Defect**:
  In Right-to-Left (RTL) languages such as Arabic, Hebrew, Urdu, or Persian, content flows horizontally from right to left. Under W3C ARIA APG standards:
  - In an RTL layout, pressing `ArrowRight` must move to the **previous** tab (to the left visually), and `ArrowLeft` must move to the **next** tab.
* **How shadcn / Radix Handles It**:
  Radix / Base UI inspects the computed `dir` attribute (`dir="rtl"` or CSS `direction: rtl`) from the DOM tree or DirectionProvider context and automatically mirrors horizontal arrow keys.

#### Gap 5: Assistive Tech Announcement Edge Cases & Virtual Cursors
* **What Our Scratch Version Did**:
  Our scratch components set static ARIA properties: `aria-selected="true"`, `aria-expanded="true"`, and `role="region"`.
* **The Screen Reader Edge Case**:
  Certain mobile screen readers (particularly iOS VoiceOver) do not automatically re-announce dynamic content updates inside tabpanels when tabs switch unless an explicit live region (`aria-live="polite"`) or focus re-announcement is triggered. Furthermore, Base UI handles selection heuristics between automatic selection (on focus) and manual selection (on Enter/Space) with debounce timers to avoid excessive speech synthesis interruptions during rapid arrow navigation.

---

### 4. Keyboard-Only Testing Protocol & Key Takeaways

To verify compliance, a comprehensive testing matrix was executed across all three custom components using **strictly keyboard input** (no mouse interaction):

| Key / Shortcut | Target Component | Expected APG Behavior | Actual Tested Behavior | Status |
| :--- | :--- | :--- | :--- | :--- |
| **`Tab`** | Modal Dialog | Advance to next interactive element inside modal | Cycles smoothly across inputs and buttons; wraps from last button to first input | **PASS** |
| **`Shift + Tab`** | Modal Dialog | Move to previous interactive element inside modal | Cycles backwards; wraps from first input to last button | **PASS** |
| **`Escape`** | Modal Dialog | Dismiss modal and restore focus to trigger | Modal immediately closes; focus returns cleanly to trigger button | **PASS** |
| **`ArrowRight`** | Tabs (Horizontal) | Focus next non-disabled tab (wrap at end) | Moves to next tab; skips disabled tab; loops to tab 1 from tab 4 | **PASS** |
| **`ArrowLeft`** | Tabs (Horizontal) | Focus previous non-disabled tab (wrap at start)| Moves to previous tab; loops from tab 1 to tab 4 | **PASS** |
| **`ArrowDown` / `Up`** | Tabs (Vertical) | Focus down/up in vertical layout | Navigates vertically with wrapping when orientation is vertical | **PASS** |
| **`Home`** | Tabs | Jump focus to first enabled tab | Focus immediately jumps to Tab 1 (Overview) | **PASS** |
| **`End`** | Tabs | Jump focus to last enabled tab | Focus immediately jumps to Tab 4 (Settings) | **PASS** |
| **`Enter`** | Disclosure / Tab | Toggle disclosure or activate manual tab | Expands/collapses panel; activates selected tab in manual mode | **PASS** |
| **`Space`** | Disclosure / Tab | Toggle disclosure without window scrolling | Smooth toggle; `event.preventDefault()` suppresses viewport scroll | **PASS** |

#### Key Takeaways from Keyboard-Only Testing:
1. **Focus Ring Visibility is Non-Negotiable**:
   Using `focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2` ensures rings only display during keyboard navigation and never distract pointer users.
2. **Timing of Return Focus Matters**:
   Restoring focus immediately in the same synchronous turn as unmounting can occasionally fail if React has not finished rendering the closed state. Utilizing `requestAnimationFrame` ensures the DOM has updated before calling `.focus()`.
3. **Space Key Suppression on Disclosures**:
   Native HTML buttons trigger `onClick` for both `Enter` and `Space`. However, pressing `Space` natively scrolls the webpage unless `event.preventDefault()` is called during `keydown`.

---

### 5. TypeScript Architecture & Zero-Escape Policy

Every component adheres to strict TypeScript standards:
- **Zero `any` types**: No implicit or explicit `any` usage.
- **Zero `@ts-ignore` or `@ts-expect-error` escapes**.
- **Accurate Element & Event Typing**:
  - Focusable selectors are queried as `HTMLElement` with `instanceof` guards.
  - Refs use strongly typed generic parameters (e.g. `useRef<HTMLDivElement | null>(null)`).
  - Form event handlers use `React.FormEvent<HTMLFormElement>`.
  - Keyboard handlers use `React.KeyboardEvent<HTMLButtonElement>` and `KeyboardEvent`.

---

### 6. Conclusion & Production Recommendations

Building accessible components from scratch provides profound insight into the mechanics of web accessibility: focus trapping, roving tabindex, ARIA synchronization, and keyboard interaction models. 

For mission-critical production applications:
- **Use Headless Primitives (shadcn/ui / Radix / Base UI)** when building complex design systems to automatically benefit from background tree inertness, focus stack managers, bidirectional RTL support, and multi-platform assistive tech quirks.
- **Use Custom Scratch Components** when zero-dependency footprint, ultra-lightweight bundles, or total control over internal state mechanics are paramount.
