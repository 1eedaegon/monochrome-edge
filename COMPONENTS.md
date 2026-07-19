# Component API Reference

Complete reference for every component in `@monochrome-edge/ui`. For an overview and installation, see the [README](../README.md); for the theming token contract, see the design-token docs.

This library ships components in two forms:

- **CSS-only components** — styling applied by class names. No JavaScript. Copy the markup, ship the CSS, done.
- **TS-powered components** — a vanilla TypeScript class that owns behavior (events, focus, layout). The React, Vue, jQuery, and Web Component adapters are thin wrappers around these same classes; they do not re-implement behavior.

Every TS-powered class exposes a public `destroy()` method (except the static `Toast`). Adapters call `destroy()` automatically on unmount/disconnect.

## How the layers relate

| Layer | Entry point | Behavior source |
|-------|-------------|-----------------|
| CSS | `@monochrome-edge/ui/css` (`dist/monochrome.min.css`) | Class names only |
| Vanilla TS classes | `@monochrome-edge/ui` (root) or per-component subpaths | Canonical implementation |
| React | `@monochrome-edge/ui/react` | Wraps vanilla classes (interactive) + native JSX (presentational) |
| Vue 3 | `@monochrome-edge/ui/vue` | Wraps vanilla classes (interactive) + `defineComponent` (presentational) |
| jQuery | `@monochrome-edge/ui/jquery` | `$.fn.mce*` plugins (re-implement a subset) |
| Web Components | `@monochrome-edge/ui/web-components` | Custom elements, prefix `mce-` |

> **Naming note.** The vanilla classes emit a **flat-kebab** class vocabulary (`search-bar-input`, `dropdown-item`, `tab-panel active`). Some `components/*/` CSS copies define BEM-style classes (`.search-bar__input`) that the runtime does not emit. This reference documents the classes the runtime actually produces and the CSS the bundle actually applies.

---

## Theming (applies to all components)

Components render against CSS custom properties resolved from two attributes set on the **same element** (the adapters use `document.documentElement`):

```html
<html data-theme-variant="warm" data-theme="dark">
```

- `data-theme-variant` = `"warm"` | `"cold"` — selects the token set (defaults to warm)
- `data-theme` = `"light"` | `"dark"` — selects the mode (light is the default; dark requires the compound selector `[data-theme-variant][data-theme="dark"]`)

There is no `prefers-color-scheme` handling and no persistence built into the theme utilities — you drive them. The `ThemeManager` class (below) is the vanilla helper; `ThemeProvider` (React/Vue), `mceTheme` (jQuery), and `ThemeController` (web-components) set the same two attributes.

### `ThemeManager` (vanilla)

`import { ThemeManager } from "@monochrome-edge/ui";`

```ts
new ThemeManager(theme?: "warm" | "cold", mode?: "light" | "dark") // defaults: "warm", "light"; applies immediately
```

| Method | Signature | Effect |
|--------|-----------|--------|
| `setTheme` | `(theme: "warm" \| "cold") => void` | Sets `data-theme-variant`, re-applies |
| `setMode` | `(mode: "light" \| "dark") => void` | Sets `data-theme`, re-applies |
| `toggle` | `() => void` | Toggles mode only (light ⇄ dark) |
| `getTheme` | `() => { theme, mode }` | Reads current state |

No `localStorage`, no storage key, no FOUC handling. It writes exactly `data-theme` and `data-theme-variant` on `document.documentElement`.

---

# CSS-only components

These need only the class names and the stylesheet. No import beyond the CSS.

## Badge

Small status/count label. CSS: `ui/atoms/badge.css`.

```html
<span class="badge badge-primary">New</span>
<span class="badge badge-success badge-pill">Active</span>
<span class="badge badge-error badge-sm">3</span>
<span class="badge badge-dot"></span>
```

Variants: `badge-default`, `badge-primary`, `badge-secondary`, `badge-success`, `badge-warning`, `badge-error`, `badge-info`, `badge-outline`. Modifiers: `badge-pill`, `badge-dot`; sizes `badge-xs`, `badge-sm`/`badge-small`, `badge-lg`/`badge-large`.

React/Vue also ship a `Badge` component (see matrix); the web component `<mce-badge variant="...">` reflects `variant` onto `badge badge-{variant}`. jQuery has no badge plugin.

## Button

Action trigger. CSS: `ui/atoms/button.css`.

```html
<button class="btn btn-primary">Save</button>
<button class="btn btn-secondary btn-small">Cancel</button>
<button class="btn btn-ghost">Ghost</button>
<button class="btn btn-danger" disabled>Delete</button>
<div class="btn-group">
  <button class="btn btn-outline">Left</button>
  <button class="btn btn-outline">Right</button>
</div>
```

Variants: `btn-primary`, `btn-secondary`, `btn-ghost`, `btn-danger`, `btn-outline`. Sizes: `btn-small`, `btn-large`. Modifiers: `btn-icon-only`, `btn-group`, `loading`.

> The CSS lives in both `ui/atoms/button.css` (bundled) and `ui/components/button.css` (present in the npm tree but imported by nothing).

## Card

Content container with header/body/footer. CSS: `ui/molecules/card.css`.

```html
<div class="card">
  <div class="card-header">
    <div class="card-header-title">Title</div>
    <div class="card-header-subtitle">Subtitle</div>
  </div>
  <div class="card-body">Body content.</div>
  <div class="card-footer card-footer-actions">
    <button class="btn btn-primary">Action</button>
  </div>
</div>
```

Modifiers: `card-bordered`, `card-elevated`, `card-ghost`, `card-clickable`, `card-hoverable`. Body density: `card-body-compact`, `card-body-large`. Grids: `card-grid`, `card-grid-2`, `card-grid-3`. Stat variant: `.stat-card` with `.stat-card-value`, `.stat-card-label`, `.stat-card-change` (`-positive` / `-negative`).

## Callout

Inline highlighted message (info/success/warning/error). CSS: `ui/molecules/callout.css`.

```html
<div class="callout callout-info">
  <span class="callout-icon">i</span>
  <div class="callout-content">
    <div class="callout-title">Heads up</div>
    <p>This is an informational callout.</p>
  </div>
</div>
```

Types: `callout-info`, `callout-success`, `callout-warning`, `callout-error`. Modifiers: `callout-solid`, `callout-sm`, `callout-lg`, `callout-dismissible` (add a `.callout-close` button — you wire the dismiss handler yourself).

## Breadcrumb

Navigation trail. CSS: `ui/atoms/breadcrumb.css`.

```html
<nav class="breadcrumb" aria-label="Breadcrumb">
  <span class="breadcrumb-item"><a href="/">Home</a></span>
  <span class="breadcrumb-separator" aria-hidden="true">/</span>
  <span class="breadcrumb-item is-active">Current</span>
</nav>
```

Variants (React/Vue/jQuery/WC helpers): `breadcrumb-compact`, `breadcrumb-large`, `breadcrumb-contained`. The framework helpers accept `items`, `separator`, `variant`, `maxItems` (ellipsis via `.breadcrumb-ellipsis`). Breadcrumb has print styles in `ui/atoms/breadcrumb.css`.

## Form / Input

Text inputs, selects, textareas, checkbox, radio, toggle, labels. CSS: `ui/atoms/input.css`, `ui/atoms/label.css`, `ui/molecules/form-group.css`.

```html
<div class="form-group">
  <label class="label" for="email">Email</label>
  <input id="email" class="input" type="email" placeholder="you@example.com" />
  <span class="helper-text">We never share it.</span>
</div>

<div class="form-group">
  <label class="label label-required" for="name">Name</label>
  <input id="name" class="input input-error" aria-invalid="true" />
  <span class="helper-text helper-text-error">Required.</span>
</div>

<label class="checkbox">
  <input type="checkbox" />
  <span class="checkbox-mark"></span>
  <span>Remember me</span>
</label>

<label class="radio">
  <input type="radio" name="plan" />
  <span class="radio-mark"></span>
  <span>Pro</span>
</label>

<label class="toggle">
  <input type="checkbox" />
  <span class="toggle-slider"></span>
</label>

<select class="select"><option>One</option></select>
<textarea class="textarea"></textarea>
```

Input state classes: `input-error`, `input-success`, `input-small`, `input-large`. Label modifiers: `label-required`, `label-optional`, `label-small`, `label-large`. Helper text: `helper-text` + `helper-text-error` / `-success` / `-warning`. Layout: `form-group-horizontal`, `form-group-inline`, `form-row`/`form-row-2..4`, `form-section` with `.form-section-title`. Input groups: `.input-group` with `.input-group-prepend` / `.input-group-append`.

> `ui/components/form.css` exists in the npm tree but is not imported by the bundle; the applied styles come from the atoms/molecules above.

## Icon / Icon Button

Inline SVG icons and icon-only buttons. CSS: `ui/atoms/icon.css`, `ui/atoms/icon-button.css`. Icon SVGs are loaded at runtime by `IconLoader` (below).

```html
<span class="icon icon-md icon-primary"><!-- <svg>… --></span>

<button class="icon-btn icon-btn-ghost" aria-label="Settings">
  <!-- <svg>… -->
</button>
```

Icon sizes: `icon-xs`/`icon-sm`/`icon-md`/`icon-lg`/`icon-xl`. Icon colors: `icon-primary`/`-secondary`/`-accent`/`-success`/`-warning`/`-error`/`-info`. Icon-button variants: `icon-btn-primary`, `icon-btn-ghost`, `icon-btn-outline`, `icon-btn-filled`, `icon-btn-two-tone`; sizes `icon-btn-sm`/`-lg`/`-xl`; group `icon-btn-group`.

### `IconLoader` (vanilla utility)

`import { iconLoader, IconLoader } from "@monochrome-edge/ui";`

`iconLoader` is a shared singleton. Default `basePath`: `/ui/assets/icons/` when on a localhost/monochrome-edge-looking path, else the jsDelivr CDN (`https://cdn.jsdelivr.net/npm/@monochrome-edge/ui@latest/dist/assets/icons/`). 25 hot-path icons are inlined and seed the cache (note: `"search"` is **not** inlined).

| Method | Signature |
|--------|-----------|
| `load` | `(name: string, opts?: { width?: number=16, height?: number=16, className?: string }) => Promise<string>` (SVG markup) |
| `loadSync` | `(name, opts?) => string` (cache-only; triggers async fetch on miss) |
| `preload` | `(names: string[]) => Promise<void>` |
| `clearCache` | `() => void` |
| `getCacheSize` | `() => number` |

The web component `<mce-icon-button icon="sun" variant="ghost">` renders an `.icon-btn` and loads the named icon via `iconLoader` (icon name allow-listed to `[a-z0-9-]`).

## Label

Standalone form label. CSS: `ui/atoms/label.css`. See Form/Input above. React/Vue export a `Label` component with a `required` prop that appends a `.text-danger` asterisk.

## Spinner

Loading indicator. CSS: `ui/atoms/spinner.css`.

```html
<span class="spinner spinner-md spinner-primary" role="status" aria-label="Loading"></span>
<span class="spinner spinner-dots"></span>
<span class="spinner spinner-pulse"></span>
```

Sizes: `spinner-xs`/`-sm`/`-md`/`-lg`/`-xl`. Styles: `spinner-dots`, `spinner-pulse`. Colors: `spinner-primary`, `spinner-white`, `spinner-dark`. (A second spinner + skeleton set also lives in `ui/components/progress/progress.css`.)

## Progress

Progress bars, circular progress, step indicators, skeletons. CSS: `ui/components/progress/progress.css`. CSS-only (no compiled JS ships for `progress`).

```html
<div class="progress">
  <div class="progress-bar" style="width: 60%"></div>
</div>

<div class="progress-steps">
  <div class="progress-step">
    <span class="progress-step-indicator">1</span>
    <span class="progress-step-label">Cart</span>
  </div>
</div>

<div class="skeleton skeleton-text"></div>
<div class="skeleton skeleton-title"></div>
```

Circular: `.progress-circle` with `.progress-circle-track`, `.progress-circle-bar`, `.progress-circle-text`. Skeletons: `skeleton-text`, `skeleton-title`, `skeleton-avatar`, `skeleton-button`, `skeleton-image`.

## Tooltip

Hover/focus tooltip. CSS: `ui/components/tooltip/tooltip.css`. **CSS-only** — the `tooltip` directory has no TS file, and this CSS is present in the npm tree but **not imported by the main bundle**, so include it explicitly if you need it.

```html
<span class="tooltip-container">
  Hover me
  <span class="tooltip tooltip-top">Tooltip text</span>
</span>
```

Placement: `tooltip-top`, `tooltip-bottom`, `tooltip-left`, `tooltip-right`. Types: `tooltip-info`, `tooltip-success`, `tooltip-warning`, `tooltip-error`. Multi-line: `tooltip-multiline`.

## Command (Command Palette)

Cmd-K style command palette shell. CSS: `ui/components/command/command.css`. **CSS-only** (ships CSS, no JS) — you wire filtering/keyboard yourself.

```html
<div class="command-palette">
  <div class="command-palette-backdrop"></div>
  <div class="command-input-wrapper">
    <span class="command-input-icon"><!-- icon --></span>
    <input class="command-input" placeholder="Type a command…" />
  </div>
  <div class="command-list">
    <div class="command-group">
      <div class="command-group-title">Actions</div>
      <div class="command-item">
        <span class="command-item-icon"><!-- icon --></span>
        <div class="command-item-content">
          <div class="command-item-title">New file</div>
          <div class="command-item-description">Create a document</div>
        </div>
        <kbd class="command-key">⌘N</kbd>
      </div>
    </div>
  </div>
  <div class="command-footer">
    <div class="command-footer-hints">
      <span class="command-hint"><kbd class="command-hint-key">↵</kbd> select</span>
    </div>
  </div>
</div>
```

Empty state: `.command-empty` with `.command-empty-icon`/`-title`/`-description`. Loading: `.command-loading`, `.command-spinner`.

## Data Table

Styled table with header, pagination, states. CSS: `ui/organisms/data-table.css`. **CSS-only** — sorting/pagination logic is yours.

```html
<div class="data-table-container">
  <div class="table-header">
    <div class="table-title">Users</div>
    <div class="table-actions"><button class="btn btn-primary">Add</button></div>
  </div>
  <table class="data-table data-table-striped">
    <thead><tr><th>Name</th><th>Role</th></tr></thead>
    <tbody><tr><td>Ada</td><td>Admin</td></tr></tbody>
  </table>
  <div class="table-footer">
    <span class="table-info">1–10 of 42</span>
    <div class="table-pagination">
      <button class="pagination-button">Prev</button>
      <button class="pagination-button">Next</button>
    </div>
  </div>
</div>
```

Modifiers: `data-table-striped`, `data-table-compact`, `data-table-borderless`, `data-table-responsive`. States: `.data-table-loading`, `.data-table-empty` (with `.data-table-empty-icon`/`-text`).

> React/Vue export lower-level presentational `Table` / `TableHeader` / `TableBody` / `TableRow` / `TableCell` components that emit `.table` markup — these are distinct from the `.data-table` organism CSS.

## Sidebar

App navigation sidebar. CSS: `ui/organisms/sidebar.css`. CSS-only.

```html
<aside class="sidebar">
  <div class="sidebar-header">
    <span class="sidebar-logo"><!-- logo --></span>
    <span class="sidebar-title">App</span>
  </div>
  <nav class="sidebar-nav">
    <div class="sidebar-nav-group">
      <div class="sidebar-nav-group-title">Main</div>
      <a class="nav-item is-active" href="#">Dashboard</a>
    </div>
  </nav>
  <div class="sidebar-footer">
    <div class="sidebar-user">
      <span class="sidebar-user-avatar"></span>
      <div class="sidebar-user-info">
        <div class="sidebar-user-name">Ada</div>
        <div class="sidebar-user-role">Admin</div>
      </div>
    </div>
  </div>
</aside>
```

Modifiers: `sidebar-compact`, `sidebar-wide`, `sidebar-floating`, `sidebar-mobile` (+ `.sidebar-overlay`, `.sidebar-toggle`).

## Header

App top bar. CSS: `ui/organisms/header.css`. CSS-only.

```html
<header class="main-header">
  <div class="header-container">
    <span class="header-logo"><!-- logo --></span>
    <span class="header-title">App</span>
    <nav class="header-nav">
      <a class="header-nav-item" href="#">Docs</a>
    </nav>
  </div>
</header>
```

> React/Vue also render a generic `<header class="header">` slot inside their `Layout` component — separate from this `.main-header` organism.

## Footer

Site footer. CSS: `ui/organisms/footer.css`. CSS-only.

```html
<footer class="footer">
  <div class="footer-container">
    <div class="footer-grid">
      <div class="footer-brand">
        <div class="footer-logo"><span class="footer-logo-text">App</span></div>
        <p class="footer-description">Tagline.</p>
      </div>
      <div class="footer-column">
        <div class="footer-column-title">Product</div>
        <a class="footer-link" href="#">Features</a>
      </div>
    </div>
    <div class="footer-bottom">
      <span class="footer-copyright">© 2026</span>
      <div class="footer-legal"><a class="footer-legal-link" href="#">Privacy</a></div>
    </div>
  </div>
</footer>
```

Minimal variant: `.footer-minimal` with `.footer-minimal-links`.

## Timeline

Vertical event timeline. CSS: `ui/organisms/timeline.css`. CSS-only.

```html
<ul class="timeline">
  <li class="timeline-item timeline-success">
    <span class="timeline-marker"><span class="timeline-marker-dot"></span></span>
    <div class="timeline-content">
      <div class="timeline-title">Deployed</div>
      <div class="timeline-time">10:24</div>
      <p class="timeline-description">Release 1.13.20 shipped.</p>
    </div>
  </li>
</ul>
```

Layouts: `timeline-alternate`, `timeline-centered`, `timeline-compact`. Status: `timeline-success`, `timeline-info`, `timeline-warning`, `timeline-error`.

## Toolbar

Action / editor / filter toolbars. CSS: `ui/organisms/toolbar.css`. CSS-only.

```html
<div class="toolbar">
  <div class="toolbar-title">Editor</div>
  <div class="toolbar-group">
    <button class="btn btn-ghost">Bold</button>
    <span class="toolbar-divider"></span>
    <button class="btn btn-ghost">Italic</button>
  </div>
  <div class="toolbar-actions"><button class="btn btn-primary">Publish</button></div>
</div>
```

Variants: `toolbar-compact`, `toolbar-large`, `floating-toolbar`. Related patterns in the same file: `.editor-toolbar` (with `.editor-toolbar-button`, `.editor-toolbar-separator`), `.filter-toolbar` (with `.filter-chip`, `.filter-group`), `.command-toolbar`.

---

# TS-powered components

Behavior lives in a vanilla class. Two constructor conventions coexist:

- **`(container, options)`** — Accordion, Modal, Tabs, Dropdown, Stepper, SearchToolbar
- **single `options` object with a `container` field** — SearchBar, TreeView, GraphView, MathRenderer

Import from the root (`@monochrome-edge/ui`) or a per-component subpath (e.g. `@monochrome-edge/ui/ui/components/modal`).

## Accordion

Collapsible panels. Source: `ui/components/accordion/accordion.ts`.

```html
<div class="accordion" data-accordion>
  <div class="accordion-item">
    <div class="accordion-header">Section 1</div>
    <div class="accordion-content">Panel 1 body.</div>
  </div>
  <div class="accordion-item">
    <div class="accordion-header">Section 2</div>
    <div class="accordion-content">Panel 2 body.</div>
  </div>
</div>
```

Open state is the `is-open` class on `.accordion-item`.

```ts
import { Accordion } from "@monochrome-edge/ui";
new Accordion(container: HTMLElement | string, options?: AccordionOptions)
```

| Option | Type | Default |
|--------|------|---------|
| `allowMultiple` | `boolean` | `false` |
| `defaultOpen` | `number[]` | `[]` |
| `onToggle` | `(index: number, isOpen: boolean) => void` | no-op |

| Method | Signature | Notes |
|--------|-----------|-------|
| `toggle` | `(index: number) => void` | Fires `onToggle` |
| `open` | `(index: number) => void` | Closes others unless `allowMultiple` |
| `close` | `(index: number) => void` | |
| `openAll` | `() => void` | Warns + no-ops unless `allowMultiple` |
| `closeAll` | `() => void` | |
| `destroy` | `() => void` | Clones+replaces each header to drop listeners |

**Events:** via `onToggle` callback (no DOM events).
**Auto-init:** `initAccordions()` scans `[data-accordion]`, sets `data-accordion-initialized="true"`. Not auto-run on import.

## Modal

Dialog overlay. Source: `ui/components/modal/modal.ts`.

```html
<div class="modal" data-modal>
  <div class="modal-backdrop"></div>
  <div class="modal-content modal-md">
    <div class="modal-header">
      <h3 class="modal-title">Title</h3>
      <button class="modal-close" data-modal-close aria-label="Close">×</button>
    </div>
    <div class="modal-body">Body.</div>
    <div class="modal-footer">
      <button class="btn btn-primary" data-modal-close>OK</button>
    </div>
  </div>
</div>
```

Open state is `.is-open` on the `.modal` container. Size classes: `modal-sm`, `modal-md`, `modal-lg`, `modal-xl`, `modal-full`.

```ts
import { Modal } from "@monochrome-edge/ui";
new Modal(container: HTMLElement | string, options?: ModalOptions)
```

| Option | Type | Default |
|--------|------|---------|
| `closeOnBackdrop` | `boolean` | `true` |
| `closeOnEscape` | `boolean` | `true` |
| `onOpen` | `() => void` | no-op |
| `onClose` | `() => void` | no-op |

| Method | Signature | Notes |
|--------|-----------|-------|
| `open` | `() => void` | Adds `.is-open`, sets `body { overflow: hidden }`, fires `onOpen` |
| `close` | `() => void` | Removes `.is-open`, restores overflow, fires `onClose` |
| `toggle` | `() => void` | |
| `isModalOpen` | `() => boolean` | |
| `destroy` | `() => void` | Removes the document `keydown` listener, then closes |

**Events:** `onOpen` / `onClose` callbacks. A backdrop click (target === container) closes when `closeOnBackdrop`; `[data-modal-close]` inside the container closes; `Escape` closes when `closeOnEscape` (listener on `document`).
**Auto-init:** `initModals()` scans `[data-modal]`.

## Tabs

Tabbed content. Source: `ui/components/tabs/tabs.ts`.

```html
<div class="tabs" data-tabs>
  <button class="tab" data-tab-id="overview">Overview</button>
  <button class="tab" data-tab-id="settings">Settings</button>
  <div class="tab-panel">Overview panel.</div>
  <div class="tab-panel">Settings panel.</div>
</div>
```

Buttons are `.tab`, panels are `.tab-panel`, active state is the `active` class on both. Panels are hidden by `.tab-panel { display: none }` and shown by `.tab-panel.active { display: block }`.

```ts
import { Tabs } from "@monochrome-edge/ui";
new Tabs(container: HTMLElement | string, options?: TabsOptions)
```

| Option | Type | Default |
|--------|------|---------|
| `defaultTab` | `number` | `0` |
| `onChange` | `(index: number, tabId?: string) => void` | no-op |

| Method | Signature |
|--------|-----------|
| `switchTo` | `(index: number) => void` |
| `next` | `() => void` (wraps) |
| `prev` | `() => void` (wraps) |
| `getCurrentIndex` | `() => number` |
| `getTabCount` | `() => number` |
| `destroy` | `() => void` (clones+replaces buttons) |

**Events:** `onChange(index, tabId)` — `tabId` is the button's `data-tab-id`. `onChange` also fires once during construction for the default tab.
**Auto-init:** `initTabs()` scans `[data-tabs]`.

## File tabs / segmented control

Styling-only variants shipped in `ui/molecules/tab.css` and `ui/components/tabs/tabs.css` (no dedicated JS). Use `.tab-item` file-style tabs with `.tab-item-icon`, `.tab-item-badge`, and a `.tab-close`, or `.segmented-control` with `.segmented-control-item`. Combine with the `Tabs` class if you want the active-toggle behavior, or drive them yourself.

## Dropdown

Trigger + menu overlay. Source: `ui/components/dropdown/dropdown.ts`.

```html
<div class="dropdown">
  <button class="dropdown-trigger" data-dropdown-target="#menu-1">Open</button>
  <div class="dropdown-menu" id="menu-1">
    <button class="dropdown-item">Edit</button>
    <button class="dropdown-item">Delete</button>
  </div>
</div>
```

The menu is resolved from the trigger's `data-dropdown-target` selector, otherwise the trigger's `nextElementSibling`. Open state: `.is-open` on the menu, `.is-active` on the trigger.

```ts
import { Dropdown } from "@monochrome-edge/ui";
new Dropdown(trigger: HTMLElement | string, options?: DropdownOptions)
```

| Option | Type | Default |
|--------|------|---------|
| `closeOnSelect` | `boolean` | `true` |
| `placement` | `"bottom" \| "top" \| "left" \| "right"` | `"bottom"` |
| `offset` | `number` | `4` |
| `onOpen` | `() => void` | no-op |
| `onClose` | `() => void` | no-op |

| Method | Signature |
|--------|-----------|
| `open` / `close` / `toggle` | `() => void` |
| `isDropdownOpen` | `() => boolean` |
| `destroy` | `() => void` (removes outside-click listener, clones+replaces trigger and menu) |

**Events:** `onOpen` / `onClose`. Clicking a `.dropdown-item` (or a descendant of one) closes when `closeOnSelect`. An outside click closes via a `document` click listener added on open and removed on close/destroy. `open()` positions the menu absolutely per `placement`/`offset`.
**Auto-init:** `initDropdowns()` scans `[data-dropdown]`.

## Toast

Transient notifications. Source: `ui/components/toast/toast.ts`. **Fully static** — no instances, no `destroy()`.

```ts
import { Toast } from "@monochrome-edge/ui";

Toast.show("Saved", { type: "success", position: "top-right", duration: 3000 });
Toast.success("Done");
Toast.error("Failed", { duration: 0 }); // 0 = no auto-dismiss
Toast.info("FYI");
Toast.warning("Careful");
Toast.dismiss(toastEl);      // remove one toast element
Toast.clearAll();            // clear all containers (or clearAll(position))
```

`Toast.show(message: string, options?: ToastOptions)`:

| Option | Type | Default |
|--------|------|---------|
| `duration` | `number` (ms; `0` disables auto-dismiss) | `3000` |
| `position` | `"top-right" \| "top-left" \| "bottom-right" \| "bottom-left" \| "top-center" \| "bottom-center"` | `"top-right"` |
| `type` | `"success" \| "error" \| "info" \| "warning"` | `"info"` |
| `closable` | `boolean` | `true` |

Convenience methods `success` / `error` / `info` / `warning` take `Omit<ToastOptions, "type">`.

**Markup produced:** a `.toast-container[data-position]` (`role="status"`, `aria-live="polite"`, `aria-atomic="true"`) holding `.toast.toast-{type}` elements. Each toast gets `role="alert"` for errors (else `role="status"`), an `.sr-only` type-label span, and a `.toast-content` span (text via `textContent`). Closable toasts get a `.toast-close` button (`aria-label="Dismiss notification"`). The show animation adds `toast-show`.

## Stepper

SVG progress stepper (two types, three layouts). Source: `ui/components/stepper/stepper.ts`.

```html
<!-- Data-driven -->
<div class="stepper"
     data-stepper
     data-type="default"
     data-layout="horizontal"
     data-steps='[
       {"indicator":"1","labelTitle":"Cart","state":"completed"},
       {"indicator":"2","labelTitle":"Pay","state":"active"},
       {"indicator":"3","labelTitle":"Done","state":"pending"}
     ]'></div>
```

Steps come from the `data-steps` JSON attribute **or** from child elements carrying `data-indicator` / `data-label-title` / `data-label-desc` / `data-title` / `data-desc` / `data-state`. Reads `data-type`, `data-layout`, `data-show-progress`, and legacy `data-mode` (`linear`/`vertical`/`snake`/`text-only`).

```ts
import { Stepper, initSteppers } from "@monochrome-edge/ui";
new Stepper(container: string | HTMLElement, options?: StepperOptions)
```

| Option | Type | Default |
|--------|------|---------|
| `type` | `"default" \| "text"` | `"default"` |
| `layout` | `"horizontal" \| "vertical" \| "snake"` | `"horizontal"` |
| `showProgress` | `boolean` | `false` |
| `nodeSize` | `number` | `24` |
| `connectorGap` | `number` | `6` |
| `minGap` | `number` | `80` |
| `padding` | `number` | `32` |
| `rowGap` | `number` | `80` |
| `onStepClick` | `((step: Step, index: number) => void) \| null` | `null` |

`Step`: `{ indicator: string; labelTitle?; labelDesc?; title?; desc?; state?: "pending" | "active" | "completed" | "failed" | "error" }`.

| Method | Signature | Notes |
|--------|-----------|-------|
| `updateStep` | `(index: number, newState: Step["state"]) => void` | Re-renders |
| `destroy` | `() => void` | Removes the `document.body` popup + `ResizeObserver` |

Renders an `<svg class="stepper-svg">`, appends a `.stepper-popup` to `document.body`, and re-renders on container resize via `ResizeObserver`.
**Events:** `onStepClick(step, index)`; hover shows the popup.
**Auto-init:** `initSteppers()` runs automatically on import (DOMContentLoaded-guarded, SSR-safe). It is the **only** init function exported from the package root and the only component that auto-runs.

**Responsive (`snake` layout).** The `snake` layout reflows as the container narrows (measured behavior): a single row while everything fits, then a zigzag of multiple rows (each even row runs right-to-left), and finally a vertical fallback at container width ≤ 240px. `updateStep()` re-renders in place — completed nodes flip to a checkmark and their connectors fill.

> **Known limitation:** labels are truncated with `truncateText()` at a fixed 30-character cap regardless of available width, and are drawn with `text-anchor: middle` and no clipping. Below ~360px, long labels can overlap adjacent steps or overflow the container; the `text` type has no vertical fallback and collides on narrow screens. Prefer short labels, or wider containers, for narrow viewports.

## SearchBar

Client-side document search with dropdown results. Source: `ui/components/search-bar/search-bar.ts`.

```ts
import { SearchBar } from "@monochrome-edge/ui";
new SearchBar(options: SearchBarOptions) // single options object
```

| Option | Type | Default |
|--------|------|---------|
| `container` | `HTMLElement \| string` | required |
| `documents` | `SearchDocument[]` | required |
| `placeholder` | `string` | `"Search..."` |
| `maxResults` | `number` | `10` |
| `highlightMatches` | `boolean` | `true` |
| `showCategories` | `boolean` | `true` |
| `onSelect` | `(doc: SearchDocument) => void` | — |
| `onSearch` | `(query: string, results: SearchDocument[]) => void` | — |

`SearchDocument`: `{ id; title; content; category?; tags?; url?; metadata? }`.

| Method | Signature |
|--------|-----------|
| `clear` | `() => void` |
| `addDocument` | `(doc: SearchDocument) => void` |
| `removeDocument` | `(id: string) => void` |
| `updateDocuments` | `(documents: SearchDocument[]) => void` |
| `destroy` | `() => void` |

**Behavior notes:** despite the "FlexSearch" naming, scoring is a simple substring scorer (title +10, content +5, tags +3); FlexSearch is not integrated. The input gets `role="combobox"`, `aria-autocomplete="list"`, `aria-expanded="false"`. Emitted markup uses flat-kebab classes (`search-bar`, `search-bar-input`, `search-bar-results`, `search-bar-result-item`, etc.). Matches are wrapped safely via `highlightSafe` (escaped `<mark class="search-highlight">`).

## SearchToolbar

Search input with debounce, autocomplete, filters, sort, and tags. Source: `ui/components/search-toolbar/search-toolbar.ts`.

```ts
import { SearchToolbar } from "@monochrome-edge/ui";
new SearchToolbar(container: string | HTMLElement, options?: SearchToolbarOptions)
```

| Option | Type | Default |
|--------|------|---------|
| `placeholder` | `string` | `"Search..."` |
| `autocomplete` | `string[] \| ((query: string) => Promise<string[]>)` | `[]` |
| `filters` | `FilterOption[]` | `[]` |
| `sortOptions` | `SortOption[]` | `[]` |
| `onSearch` | `(query: string, filters: Record<string, string>, sort: string) => void` | no-op |
| `debounceMs` | `number` | `300` |

`FilterOption`: `{ id; label; values: { value; label }[]; default? }`. `SortOption`: `{ value; label }`.

| Method | Signature |
|--------|-----------|
| `clear` | `() => void` |
| `getQuery` | `() => string` |
| `getFilters` | `() => Record<string, string>` |
| `getSort` | `() => string` |
| `setResultsCount` | `(count: number) => void` |
| `destroy` | `() => void` |
| `selectedTags` | `Set<string>` (public property) |

**Behavior notes:** filters/sort render as `.search-toolbar-filter-btn` buttons toggling `is-active`; tags render into `#search-tags` if present, else `.search-toolbar-tags`; the autocomplete panel is `position: fixed`. The module also assigns `window.SearchToolbar` as a side effect.

## TreeView

Hierarchical expand/collapse tree. Source: `ui/components/tree-view/tree-view.ts`.

```ts
import { TreeView } from "@monochrome-edge/ui";
new TreeView(options: TreeViewOptions) // single options object
```

| Option | Type | Notes |
|--------|------|-------|
| `container` | `HTMLElement` | required |
| `data` | `TreeNode[]` | required |
| `expandedByDefault` | `boolean` | optional |
| `onNodeClick` | `(node: TreeNode) => void` | optional |
| `onNodeToggle` | `(node: TreeNode, isExpanded: boolean) => void` | optional |

`TreeNode`: `{ id; label; icon?; children?: TreeNode[]; isExpanded?; metadata? }`.

| Method | Signature |
|--------|-----------|
| `destroy` | `() => void` |

**Markup:** classes `tree-view`, `tree-list`, `tree-item`, `tree-item-content`, `tree-toggle` (`is-expanded`), `tree-spacer`, `tree-icon`, `tree-label`, `tree-children`. Toggle buttons set `aria-expanded` and `aria-label` (Collapse/Expand). Expand/collapse state is written back into the caller-provided `TreeNode` objects (`isExpanded`).

> Distinct from the CSS-only `ui/components/tree/tree.css` (`.tree-node`, `.tree-children`, `.tree-context-menu`, …), which ships styling for a richer tree with actions/badges/context menus but no JS.

## GraphView

Force-directed document graph on `<canvas>`. Source: `ui/components/graph-view/graph-view.ts`.

```ts
import { GraphView } from "@monochrome-edge/ui";
new GraphView(options: GraphViewOptions) // single options object
```

| Option | Type | Default |
|--------|------|---------|
| `container` | `HTMLElement \| string` | required |
| `documents` | `DocumentMetadata[]` | required |
| `width` | `number` | container width, else `800` |
| `height` | `number` | container height, else `600` |
| `iterations` | `number` | `300` |
| `repulsionStrength` | `number` | `800` |
| `attractionStrength` | `number` | `0.01` |
| `nodeRadius` | `number` | `8` |
| `showLabels` | `boolean` | `true` |
| `onNodeClick` | `(node: { id; title; tags: string[] }) => void` | — |

| Method | Signature |
|--------|-----------|
| `runLayout` / `stopLayout` / `resetLayout` | `() => void` |
| `updateDocuments` | `(documents: DocumentMetadata[]) => void` |
| `getStats` | `() => { nodeCount; edgeCount; avgDegree; maxDegree }` |
| `resize` | `(width?: number, height?: number) => void` |
| `resetView` | `() => void` |
| `render` | `() => void` |
| `destroy` | `() => void` |

Creates a `<canvas class="graph-view-canvas">`, observes the container with `ResizeObserver`. The renderer (`CanvasRenderer`) supports drag-pan, wheel zoom, and pinch zoom clamped to scale `0.1–3`.

### Graph internals (also exported)

- **`DocumentGraph`** — builds the graph model from documents. Maps string ids to sequential integer ids, stores forward/backward adjacency as `Uint32Array` (O(1) backlinks), node mass = `1 + 0.1 * links.length`, random 800×600 initial positions unless `doc.x`/`doc.y` given; links to unknown targets are silently dropped. `getStats()` → `{ nodeCount, edgeCount, avgDegree, maxDegree }`.
- **`BarnesHutLayout`** — force layout. Defaults: `theta 0.5`, `damping 0.3`, `initialAlpha 1.0`, `alphaDecay 0.01`, `minAlpha 0.001`; constants: spring rest length 100, max velocity 10, boundary margin 50. `simulate(onProgress)` runs the full iteration loop internally (not single-step).
- **`CanvasRenderer`** — pan/zoom canvas renderer (see above).
- **`QuadTree`** — spatial index used by Barnes–Hut.

All four are exported from the package root with their option/type interfaces.

## MathRenderer

KaTeX-based math rendering. Source: `ui/components/math-renderer/math-renderer.ts`.

```ts
import { MathRenderer, renderAllMath } from "@monochrome-edge/ui";
const m = new MathRenderer({ container, displayMode: true });
m.render("\\frac{a}{b}");
m.update("\\sqrt{x}");
```

| Option | Type | Default |
|--------|------|---------|
| `container` | `HTMLElement \| string` | required |
| `displayMode` | `boolean` | `false` |
| `throwOnError` | `boolean` | `false` |
| `errorColor` | `string` | `"#cc0000"` |
| `macros` | `Record<string, string>` | `{}` |

| Method | Signature |
|--------|-----------|
| `render` | `(latex?: string) => void` (falls back to container `textContent`) |
| `update` | `(latex: string) => void` |
| `destroy` | `() => void` |

`renderAllMath(options?)` renders all `.math-inline` (inline) and `.math-display` (display) elements on the page.

**Requirement:** a global `window.katex` must be present — KaTeX is **not** bundled. If absent, the renderer `console.warn`s and no-ops.

## Editor

The rich Markdown/WYSIWYG editor is a larger subsystem with its own build (`dist/monochrome-edge-editor.*` + `dist/editor.min.css`), global name `MonochromeEditor`, and 12 core features (headers, bold/italic/strike, quote, links, image upload, code blocks, LaTeX math, lists, tables, document links). It is not part of the `exports` map — load the editor bundle and CSS directly.

- Architecture and feature contract: [`ui/components/editor/ARCHITECTURE.md`](../ui/components/editor/ARCHITECTURE.md)
- Bundles: `dist/monochrome-edge-editor.esm.js`, `.js` (UMD), `.min.js`, `.standalone.js` (IIFE, inlines KaTeX/Prism); non-standalone builds treat `katex` and `prismjs` as external.

---

# Consolidated availability matrix

Legend: ✅ available · ➖ not provided by that adapter · CSS = class-only (any framework can use the classes).

Import paths:

- **Vanilla CSS:** `@monochrome-edge/ui/css` (all classes in one bundle)
- **TS class:** `@monochrome-edge/ui` (root) — some also at `@monochrome-edge/ui/ui/components/<name>`
- **React:** `@monochrome-edge/ui/react`
- **Vue:** `@monochrome-edge/ui/vue`
- **jQuery:** `@monochrome-edge/ui/jquery` (`$.fn.mce*`)
- **Web Component:** `@monochrome-edge/ui/web-components` (auto-registers on import)

| Component | Vanilla CSS | TS class | React | Vue | jQuery | Web Component |
|-----------|:-----------:|:--------:|:-----:|:---:|:------:|---------------|
| Accordion | `.accordion` | `Accordion` | `Accordion` | `Accordion` | `mceAccordion` | `<mce-accordion>` |
| Badge | `.badge` | ➖ | `Badge` | `Badge` | ➖ | `<mce-badge>` |
| Breadcrumb | `.breadcrumb` | ➖ | `Breadcrumb` | `Breadcrumb` | `mceBreadcrumb` | `<mce-breadcrumb>` + `<mce-breadcrumb-item>` |
| Button | `.btn` | ➖ | `Button` | `Button` | `mceButton` | `<mce-button>` |
| Card | `.card` | ➖ | `Card` | `Card` | `mceCard` | `<mce-card>` |
| Callout | `.callout` | ➖ | ➖ | ➖ | ➖ | ➖ |
| Checkbox | `.checkbox` | ➖ | `Checkbox` | `Checkbox` | ➖ | `<mce-checkbox>` |
| Command palette | `.command-palette` | ➖ | ➖ | ➖ | ➖ | ➖ |
| Data table | `.data-table` | ➖ | `Table`* | `Table`* | ➖ | ➖ |
| Dropdown | `.dropdown` | `Dropdown` | `Dropdown` | `Dropdown` | ➖ | ➖ |
| Footer | `.footer` | ➖ | ➖ | ➖ | ➖ | ➖ |
| Form / Input | `.input` `.form-group` | ➖ | `Input`/`Select`/`Textarea`/`Radio`/`FormGroup` | same set | ➖ | `<mce-input>` |
| GraphView | `.graph-view-canvas` | `GraphView` | `GraphView` | `GraphView` | ➖ | `<mce-graph-view>` |
| Header | `.main-header` | ➖ | `Layout`* | `Layout`* | ➖ | ➖ |
| Icon | `.icon` | `IconLoader` | ➖ | ➖ | ➖ | ➖ |
| Icon button | `.icon-btn` | `IconLoader` | ➖ | ➖ | ➖ | `<mce-icon-button>` |
| Icon toggle | `.icon-btn-toggle` | ➖ | `IconToggle` | `IconToggle` | `mceIconToggle` | `<mce-icon-toggle>` |
| Label | `.label` | ➖ | `Label` | `Label` | ➖ | ➖ |
| MathRenderer | `.math-inline`/`.math-display` | `MathRenderer` | `Math` | `Math` | ➖ | ➖ |
| Modal | `.modal` | `Modal` | `Modal` | `Modal` | `mceModal` | `<mce-modal>` |
| Nav | `.nav` `.nav-item` | ➖ | `Nav`/`NavGroup`/`NavItem` | same set | ➖ | ➖ |
| Progress | `.progress` | ➖ | ➖ | ➖ | ➖ | ➖ |
| SearchBar | `.search-bar` | `SearchBar` | `SearchBar` | `SearchBar` | ➖ | ➖ |
| SearchToolbar | `.search-toolbar-*` | `SearchToolbar` | `SearchToolbar` | `SearchToolbar` | ➖ | `<mce-search-toolbar>` |
| Sidebar | `.sidebar` | ➖ | ➖ | ➖ | ➖ | ➖ |
| Spinner | `.spinner` | ➖ | ➖ | ➖ | ➖ | ➖ |
| Stepper | `.stepper` | `Stepper` | `Stepper` | `Stepper` | ➖ | ➖ |
| Tabs | `.tabs` `.tab` `.tab-panel` | `Tabs` | `Tabs` | `Tabs` | `mceTabs` | `<mce-tabs>` |
| File tabs / segmented | `.tab-item` `.segmented-control` | ➖ | ➖ | ➖ | ➖ | ➖ |
| Timeline | `.timeline` | ➖ | ➖ | ➖ | ➖ | ➖ |
| Toast | `.toast` `.toast-container` | `Toast` (static) | `useToast()` hook | `useToast()` | `mceToast` | `<mce-toast>` |
| TOC | `.toc` `.toc-collapsible` | `createTocHoverCard` / `createTocCollapsible` (dom-helpers) | `TOC`/`TocHoverCard`/`TocCollapsible` | same set | ➖ | `<mce-toc>` + `<mce-toc-item>` |
| Toolbar | `.toolbar` | ➖ | ➖ | ➖ | ➖ | ➖ |
| Tooltip | `.tooltip`† | ➖ | ➖ | ➖ | ➖ | ➖ |
| TreeView | `.tree-view` | `TreeView` | `TreeView` | `TreeView` | ➖ | `<mce-tree-view>` |
| Changelog | `.changelog-container` | `initChangelogPagination` | `Changelog` | `Changelog` | ➖ | ➖ |
| Theme control | (attributes) | `ThemeManager` | `ThemeProvider`/`useTheme` | `ThemeProvider`/`useTheme` | `mceTheme` | `ThemeController` |
| Editor | `dist/editor.min.css` | `MonochromeEditor` bundle | ➖ | ➖ | ➖ | ➖ |

\* React/Vue `Table` and `Layout` emit generic `.table` / `.header` / `.sidebar` markup — they are lower-level primitives, not the full `.data-table` / `.main-header` organisms.
† Tooltip CSS ships in the npm tree but is **not** in the default `monochrome.min.css` bundle — include `ui/components/tooltip/tooltip.css` explicitly.

## Adapter notes

- **React interactive wrappers** (`Accordion`, `Tabs`, `Dropdown`, `SearchBar`, `SearchToolbar`, `TreeView`, `Stepper`, `Math`, `GraphView`) mount a ref container, instantiate the vanilla class in an effect, keep callbacks fresh via refs, and call `destroy()` on unmount. They re-export from `@monochrome-edge/ui/react`. React also ships presentational components (`Button`, `Card`, `Modal`, `Input`, `Table`, `Badge`, `Breadcrumb`, `IconToggle`, `TOC`, `Changelog`, …) implemented as native JSX. The React `Modal` is prop-driven (`isOpen`/`onClose`) with focus-trap + focus-restore, and differs from the vanilla `Modal` class API.
- **Vue interactive wrappers** mirror React one-for-one via `defineComponent` (`MonoAccordion`, `MonoTabs`, `MonoDropdown`, `MonoSearchBar`, `MonoSearchToolbar`, `MonoTreeView`, `MonoStepper`, `MonoMath`, `MonoGraphView`), each mounting the vanilla class in `onMounted` and calling `destroy()` in `onBeforeUnmount`. Presentational components (`Button`, `Card`, `Input`, `Modal`, `Table`, `Badge`, `Breadcrumb`, `IconToggle`, `TOC`, `Changelog`, …) are `defineComponent` render functions.
- **jQuery** provides a smaller surface: `mceButton`, `mceCard`, `mceModal`, `mceTabs`, `mceAccordion`, `mceToast`, `mceTheme`, `mceIconToggle`, `mceBreadcrumb`, plus the `MCE` helper object (`toast`, `setTheme`, `toggleTheme`, `getTheme`). The jQuery `mceModal`/`mceTabs`/`mceAccordion` are independent re-implementations (they use `.tab-button`, not `.tab`), not wrappers of the vanilla classes.
- **Web Components** auto-register on import (idempotent `customElements.define` guard). Interactive elements `<mce-tree-view>`, `<mce-graph-view>`, `<mce-search-toolbar>` wrap the vanilla classes and dispatch bubbling/composed `CustomEvent`s (`node-click`, `node-toggle`, `search`); presentational elements render class-based markup and reflect attributes. `<mce-tree-view>` takes data via a `.data` property; `<mce-graph-view>` via `.setDocuments(...)`; `<mce-search-toolbar>` via `.setAutocomplete(fn)`.
