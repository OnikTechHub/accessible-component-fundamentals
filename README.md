# FE-03: Accessible Component Fundamentals

An exploration and implementation of core web accessibility (a11y) patterns built strictly following the **W3C ARIA Authoring Practices Guide (APG)** in **React 19**, **TypeScript**, and **Tailwind CSS**, comparing custom scratch implementations against production-grade headless primitives from **shadcn/ui** (Base UI / Radix).

---

## 🌟 Key Features

### 1. Custom Scratch Components (Zero Third-Party Component Dependencies)
- **Modal Dialog (`playground/Modal.tsx` / `src/playground/Modal.tsx`)**:
  - Proper ARIA roles: `role="dialog"`, `role="alertdialog"`, `aria-modal="true"`, `aria-labelledby`, and `aria-describedby`.
  - **Focus Management**: Saves previous active element on open, automatically moves focus into the modal, and restores focus back to the exact trigger button upon closing.
  - **Focus Trap**: Intercepts `Tab` and `Shift+Tab` to keep keyboard cycling strictly bounded within interactive children inside the modal.
  - **Keyboard & Viewport**: Dismisses cleanly on `Escape` key press or backdrop click. Prevents background page scrolling while open with layout shift compensation.
  - Teleportation via React `createPortal` to `document.body`.
- **Tabs (`playground/Tabs.tsx` / `src/playground/Tabs.tsx`)**:
  - Semantic ARIA roles: `role="tablist"`, `role="tab"`, `role="tabpanel"`.
  - Proper state binding: `aria-selected`, `aria-controls`, `aria-labelledby`.
  - **Roving `tabIndex`**: Active tab receives `tabIndex={0}`, while inactive sibling tabs receive `tabIndex={-1}`.
  - **Keyboard Navigation**: Full support for `ArrowRight`, `ArrowLeft`, `Home`, and `End` keys (plus `ArrowDown` and `ArrowUp` for vertical orientation) with looping.
  - Configurable `activationMode` (`automatic` vs `manual`).
  - Accessible tabpanels (`tabIndex={0}`) allowing keyboard users to scroll and read panel content.
- **Disclosure (`playground/Disclosure.tsx` / `src/playground/Disclosure.tsx`)**:
  - Trigger `<button>` element with synchronized `aria-expanded` and `aria-controls`.
  - Collapsible content region with `role="region"` and `aria-labelledby`.
  - **Keyboard Support**: Seamless toggle on `Enter` and `Space` with page scroll suppression.
  - High-contrast visible focus indicators (`focus-visible:ring-2`).

### 2. Side-by-Side Comparison with `shadcn/ui`
- Initialized `shadcn/ui` with generated `dialog` and `tabs` components in `src/components/ui/`.
- Interactive live comparison within `PlaygroundDemo.tsx` allowing keyboard testers to switch between scratch and headless implementations side-by-side.

### 3. Detailed Architecture Comparison (`NOTES.md`)
- Deep technical audit comparing scratch implementations against `shadcn/ui` (Radix / Base UI), covering:
  - Background tree suppression (`inert` & `aria-hidden` vs simple keydown interception).
  - Nested modal stacking and focus layers (`FocusScope` stack manager).
  - Portal teleportation and CSS stacking context traps (`transform`, `filter`, `clip-path`).
  - Bidirectional RTL (Right-to-Left) mechanics.
  - Assistive technology announcement edge cases.
  - Complete keyboard-only testing audit matrix.

---

## ⌨️ Keyboard Shortcuts Cheat-Sheet

| Key | Context | Behavior |
| :--- | :--- | :--- |
| <kbd>Tab</kbd> / <kbd>Shift + Tab</kbd> | Modal Dialog | Cycles forward/backward through interactive elements; trapped inside modal |
| <kbd>Escape</kbd> | Modal Dialog | Dismisses the modal and restores focus back to trigger button |
| <kbd>→</kbd> / <kbd>←</kbd> | Tabs (Horizontal) | Roving focus to next/previous enabled tab (loops at boundaries) |
| <kbd>↓</kbd> / <kbd>↑</kbd> | Tabs (Vertical) | Roving focus down/up in vertical layout (loops at boundaries) |
| <kbd>Home</kbd> / <kbd>End</kbd> | Tabs | Immediately jumps focus to the first or last enabled tab |
| <kbd>Enter</kbd> / <kbd>Space</kbd> | Disclosure & Tabs | Toggles disclosure expand/collapse; activates focused tab in manual mode |

---

## 📁 Project Structure

```
├── NOTES.md                     # Comprehensive comparison & keyboard audit notes
├── playground/                  # Root export layer
│   ├── Modal.tsx                # Custom scratch Modal Dialog
│   ├── Tabs.tsx                 # Custom scratch Tabs
│   ├── Disclosure.tsx           # Custom scratch Disclosure
│   └── PlaygroundDemo.tsx       # Interactive showcase page component
├── src/
│   ├── app/
│   │   ├── globals.css          # Tailwind CSS styles & CSS custom properties
│   │   ├── layout.tsx           # Root HTML layout & system fonts
│   │   └── page.tsx             # Main entry page rendering PlaygroundDemo
│   ├── components/
│   │   └── ui/                  # shadcn/ui generated components
│   │       ├── button.tsx       # shadcn Button
│   │       ├── dialog.tsx       # shadcn Dialog
│   │       └── tabs.tsx         # shadcn Tabs
│   ├── lib/
│   │   └── utils.ts             # Tailwind class merging utility
│   └── playground/              # Core scratch accessible components
│       ├── Modal.tsx
│       ├── Tabs.tsx
│       ├── Disclosure.tsx
│       └── PlaygroundDemo.tsx
├── package.json
└── tsconfig.json
```

---

## 🚀 Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Run the Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) to access the interactive accessibility showcase.

### 3. Build & Verify Type Safety
```bash
npm run lint
npm run build
```
Verification passes with **0 TypeScript errors (0 `any` types)** and **0 ESLint warnings**.
