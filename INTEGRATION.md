# Integration & Usage Guide

This guide covers every supported way to consume `@monochrome-edge/ui`: from a zero-install `<script>` tag, from copied source files (shadcn-style), and from an `npm install`, plus theming, framework adapters, the editor, and Content-Security-Policy notes.

For a high-level overview and quickstart see [README.md](../README.md). For the editor internals see [ui/components/editor/ARCHITECTURE.md](../ui/components/editor/ARCHITECTURE.md).

> **Version note.** The published package version is defined in `package.json` (currently `1.13.20`). The exported `VERSION` constant in `ui/index.ts` is bumped by a separate lifecycle script and may lag the package version — do not rely on `VERSION` to detect the installed release; read it from your package manager instead.

---

## 1. Zero-install via CDN

The npm `files` field ships both the built `dist/` and the raw `ui/` source tree, so every path below resolves on any npm CDN. Two mirrors are shown for each asset — jsDelivr and unpkg. Pin a version in production (replace `@latest` with e.g. `@1.13.20`) so a new release cannot change your bytes unexpectedly.

### URL pattern

```
https://cdn.jsdelivr.net/npm/@monochrome-edge/ui@<version>/<path-in-package>
https://unpkg.com/@monochrome-edge/ui@<version>/<path-in-package>
```

`<path-in-package>` is any file under `dist/` or `ui/`.

### CSS bundles

| File | Contents | jsDelivr | unpkg |
|------|----------|----------|-------|
| `dist/monochrome.min.css` | Full bundle (both themes + all components) | `https://cdn.jsdelivr.net/npm/@monochrome-edge/ui@latest/dist/monochrome.min.css` | `https://unpkg.com/@monochrome-edge/ui@latest/dist/monochrome.min.css` |
| `dist/warm-theme.min.css` | Warm design tokens only | `https://cdn.jsdelivr.net/npm/@monochrome-edge/ui@latest/dist/warm-theme.min.css` | `https://unpkg.com/@monochrome-edge/ui@latest/dist/warm-theme.min.css` |
| `dist/cold-theme.min.css` | Cold design tokens only | `https://cdn.jsdelivr.net/npm/@monochrome-edge/ui@latest/dist/cold-theme.min.css` | `https://unpkg.com/@monochrome-edge/ui@latest/dist/cold-theme.min.css` |
| `dist/editor.min.css` | Editor styles | `https://cdn.jsdelivr.net/npm/@monochrome-edge/ui@latest/dist/editor.min.css` | `https://unpkg.com/@monochrome-edge/ui@latest/dist/editor.min.css` |

`monochrome.min.css` already contains **both** the warm and cold token sets — you do not need `warm-theme.min.css`/`cold-theme.min.css` in addition to it. The theme-only files exist for cases where you ship your own component CSS and just want the tokens.

### JS bundles

| File | Format | Global | jsDelivr |
|------|--------|--------|----------|
| `dist/ui.js` | UMD | `MonochromeEdge` | `https://cdn.jsdelivr.net/npm/@monochrome-edge/ui@latest/dist/ui.js` |
| `dist/ui.esm.js` | ES module | — | `https://cdn.jsdelivr.net/npm/@monochrome-edge/ui@latest/dist/ui.esm.js` |
| `dist/web-components.esm.js` | ES module, auto-registers `<mce-*>` elements | — | `https://cdn.jsdelivr.net/npm/@monochrome-edge/ui@latest/dist/web-components.esm.js` |
| `dist/monochrome-edge-editor.standalone.js` | IIFE, KaTeX + Prism inlined | `MonochromeEditor` | `https://cdn.jsdelivr.net/npm/@monochrome-edge/ui@latest/dist/monochrome-edge-editor.standalone.js` |
| `dist/monochrome-edge-editor.min.js` | UMD, KaTeX/Prism **external** | `MonochromeEditor` | `https://cdn.jsdelivr.net/npm/@monochrome-edge/ui@latest/dist/monochrome-edge-editor.min.js` |

Swap the host to `https://unpkg.com/...` for the unpkg equivalent of any of these.

> The UMD bundle `dist/ui.js` is self-contained (no external `require`s) and exposes everything from `ui/index.ts` on `window.MonochromeEdge`. `dist/ui.cjs` is a byte-identical copy used by `require()` under Node.

### Complete copy-paste HTML page

This page loads the full CSS, sets the theme on `<html>`, and drives a `Modal`, a `Toast`, and the `ThemeManager` from the UMD global. No build step, no install.

```html
<!doctype html>
<html lang="en" data-theme-variant="warm" data-theme="light">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Monochrome Edge — CDN demo</title>
    <link
      rel="stylesheet"
      href="https://cdn.jsdelivr.net/npm/@monochrome-edge/ui@latest/dist/monochrome.min.css"
    />
  </head>
  <body>
    <main class="container">
      <h1>Monochrome Edge</h1>

      <div class="card">
        <div class="card-body">
          <button type="button" class="btn btn-primary" id="open">Open modal</button>
          <button type="button" class="btn btn-secondary" id="toast">Show toast</button>
          <button type="button" class="btn btn-ghost" id="mode">Toggle dark</button>
        </div>
      </div>

      <!-- Modal markup: .modal toggled to .is-open by the Modal class -->
      <!-- Size class goes on .modal: .modal-medium (organisms CSS scopes it as `.modal-medium .modal-content`). -->
      <div class="modal modal-medium" id="demo-modal">
        <div class="modal-content">
          <div class="modal-header">
            <h3 class="modal-title">Hello</h3>
            <button type="button" class="modal-close" data-modal-close aria-label="Close">×</button>
          </div>
          <div class="modal-body">This modal is controlled from the UMD global.</div>
        </div>
      </div>
    </main>

    <script src="https://cdn.jsdelivr.net/npm/@monochrome-edge/ui@latest/dist/ui.js"></script>
    <script>
      const { Modal, Toast, ThemeManager } = window.MonochromeEdge;

      const theme = new ThemeManager("warm", "light");
      const modal = new Modal("#demo-modal", { closeOnBackdrop: true, closeOnEscape: true });

      document.getElementById("open").addEventListener("click", () => modal.open());
      document.getElementById("toast").addEventListener("click", () =>
        Toast.success("Saved!", { position: "top-right" }),
      );
      document.getElementById("mode").addEventListener("click", () => theme.toggle());
    </script>
  </body>
</html>
```

Key contract points exercised above:

- Theme is set by two attributes on the **same** element (`data-theme-variant` + optional `data-theme`). Light is the default — dark mode only activates when `data-theme="dark"` is present alongside a variant.
- `Modal`, `Tabs`, `Dropdown`, `Accordion`, `Stepper`, and `SearchToolbar` take `(container, options)`; the container may be a selector string or an element.
- `Toast` is fully static — there are no instances. Use `Toast.show/success/error/info/warning`.

---

## 2. shadcn-style vendoring (copy files into your project)

Because the `ui/` source tree is published verbatim, you can copy the parts you need directly into your repo and own them — no runtime dependency. This works well when you want to edit tokens or component CSS in place.

### What to copy

**Always copy the token + base layer** so semantic variables resolve:

```
ui/monochrome-edge.css          # the aggregator (imports everything below)
ui/tokens/warm-theme.css
ui/tokens/cold-theme.css
ui/base/reset.css               # .sr-only, :focus-visible, reduced-motion
ui/base/responsive.css          # .container, .row/.col grid
```

The simplest vendoring is to copy the whole `ui/` directory and import `ui/monochrome-edge.css` once. If you want only a subset, copy the token files plus the specific component's CSS and TS.

### Per-component file map

Each interactive component is a `.ts` behavior plus one or more `.css` files. The vanilla behaviors emit the **flat-kebab** class vocabulary (e.g. `dropdown-item`, `toast-container`, `modal is-open`, `tab-panel active`), which is styled by the `molecules/` and `organisms/` CSS. The newer `components/<name>/` CSS copies use BEM (`.tree-view__item`) and are **not** what the TS emits — prefer the `molecules`/`organisms` stylesheets when hand-picking CSS.

| Component | Behavior (TS) | CSS to copy |
|-----------|---------------|-------------|
| Modal | `ui/components/modal/modal.ts` | `ui/organisms/modal.css` |
| Toast | `ui/components/toast/toast.ts` | `ui/molecules/toast.css` |
| Tabs | `ui/components/tabs/tabs.ts` | `ui/molecules/tab.css` |
| Dropdown | `ui/components/dropdown/dropdown.ts` | `ui/molecules/dropdown.css` |
| Accordion | `ui/components/accordion/accordion.ts` | (styled by base component CSS; copy `ui/components/accordion/` if present) |
| Stepper | `ui/components/stepper/stepper.ts` | renders inline SVG; component CSS under `ui/components/stepper/` |
| SearchBar | `ui/components/search-bar/search-bar.ts` | `ui/molecules/search-bar.css` |
| SearchToolbar | `ui/components/search-toolbar/search-toolbar.ts` | `ui/molecules/search-toolbar.css` |
| TreeView | `ui/components/tree-view/tree-view.ts` | `ui/molecules/tree-view.css` |
| GraphView | `ui/components/graph-view/graph-view.ts` (+ `graph-builder.ts`, `barnes-hut-layout.ts`, `canvas-renderer.ts`, `quad-tree.ts`) | `ui/organisms/graph-view.css` |
| MathRenderer | `ui/components/math-renderer/math-renderer.ts` | `ui/molecules/math-renderer.css` (requires global `window.katex`) |

Shared utilities pulled in by the search and adapter modules:

```
ui/utils/security.ts     # escapeHtml, escapeRegExp, safeUrl, highlightSafe
ui/utils/icon-loader.ts  # IconLoader (needs ui/utils/icon-data.ts)
ui/utils/theme-manager.ts
```

> **Caveat.** Several CSS files ship but are imported by nothing (`ui/components/tooltip/tooltip.css`, `ui/components/button.css`, `ui/components/form.css`, `ui/organisms/table.css`, and the editor's `editor.css`/`editor-blocks.css`/`editor-table.css`). If you vendor selectively, verify the class you need is actually in an imported stylesheet — the canonical aggregate is `ui/monochrome-edge.css`.

---

## 3. npm install path

```bash
npm install @monochrome-edge/ui
```

Peers (`react`, `react-dom`, `vue`, `jquery`) are declared as **optional** via `peerDependenciesMeta` — install only the adapter you use. There is no hard `peerDependencies` block, so npm will not auto-install or warn about a missing framework; add it yourself.

### Package exports

Every subpath below is declared in `package.json` `exports`. Bare specifiers resolve to ESM (`import`) or CJS (`require`) automatically.

| Import specifier | `import` (ESM) | `require` (CJS) | Types |
|------------------|----------------|-----------------|-------|
| `@monochrome-edge/ui` | `dist/ui.esm.js` | `dist/ui.cjs` | `dist/types/ui/index.d.ts` |
| `@monochrome-edge/ui/ui` | `dist/ui.esm.js` | `dist/ui.cjs` | `dist/types/ui/index.d.ts` |
| `@monochrome-edge/ui/ui/components/search-bar` | `dist/ui/components/search-bar.esm.js` | `.cjs` | `search-bar.d.ts` |
| `@monochrome-edge/ui/ui/components/search-toolbar` | `dist/ui/components/search-toolbar.esm.js` | `.cjs` | `search-toolbar.d.ts` |
| `@monochrome-edge/ui/ui/components/tree-view` | `dist/ui/components/tree-view.esm.js` | `.cjs` | `tree-view.d.ts` |
| `@monochrome-edge/ui/ui/components/graph-view` | `dist/ui/components/graph-view.esm.js` | `.cjs` | `graph-view.d.ts` |
| `@monochrome-edge/ui/ui/components/math-renderer` | `dist/ui/components/math-renderer.esm.js` | `.cjs` | `math-renderer.d.ts` |
| `@monochrome-edge/ui/ui/components/accordion` | `dist/ui/components/accordion.esm.js` | `.cjs` | `accordion.d.ts` |
| `@monochrome-edge/ui/ui/components/modal` | `dist/ui/components/modal.esm.js` | `.cjs` | `modal.d.ts` |
| `@monochrome-edge/ui/ui/components/tabs` | `dist/ui/components/tabs.esm.js` | `.cjs` | `tabs.d.ts` |
| `@monochrome-edge/ui/ui/components/toast` | `dist/ui/components/toast.esm.js` | `.cjs` | `toast.d.ts` |
| `@monochrome-edge/ui/ui/components/dropdown` | `dist/ui/components/dropdown.esm.js` | `.cjs` | `dropdown.d.ts` |
| `@monochrome-edge/ui/react` | `dist/react.esm.js` | `dist/react.cjs` | `src/react.d.ts` |
| `@monochrome-edge/ui/vue` | `dist/vue.esm.js` | `dist/vue.cjs` | `src/vue.d.ts` |
| `@monochrome-edge/ui/jquery` | `dist/jquery.esm.js` | `dist/jquery.cjs` | `src/jquery.d.ts` |
| `@monochrome-edge/ui/web-components` | `dist/web-components.esm.js` | `dist/web-components.cjs` | `src/web-components.d.ts` |
| `@monochrome-edge/ui/css` | `dist/monochrome.min.css` | — | — |
| `@monochrome-edge/ui/warm` | `dist/warm-theme.min.css` | — | — |
| `@monochrome-edge/ui/cold` | `dist/cold-theme.min.css` | — | — |
| `@monochrome-edge/ui/assets/*` | `dist/assets/*` | — | — |

### Not exported (known gaps)

- **`Stepper`** compiles to `dist/ui/components/stepper.*` and has types, but has **no** deep-import subpath. Import it from the main entry instead: `import { Stepper } from "@monochrome-edge/ui"`.
- **The editor** (`dist/monochrome-edge-editor*.js`, `dist/editor.min.css`) has **no** exports entry. The editor README's `@monochrome-edge/ui/editor` import path is not wired as a package export — consume the editor via the CDN standalone bundle or a direct file path (see §6).
- **`command`, `progress`, `tooltip`, `tree`** ship CSS only (no compiled JS).

### Typical install usage

```ts
// Named imports from the main entry — recommended.
import { Modal, Tabs, Toast, ThemeManager, Dropdown } from "@monochrome-edge/ui";
import "@monochrome-edge/ui/css";

const modal = new Modal("#dialog", { closeOnEscape: true });
Toast.info("Ready");
```

Deep imports keep bundles small when you only need one component:

```ts
import { TreeView } from "@monochrome-edge/ui/ui/components/tree-view";
```

`ui.esm.js` and the per-component ESM files are marked side-effect-free (`sideEffects` in `package.json` only flags CSS and the web-components/editor bundles), so bundlers tree-shake unused component classes.

---

## 4. Theming

### The contract

Two attributes on a **single** element (adapters use `document.documentElement`, i.e. `<html>`):

| Attribute | Values | Meaning | Default |
|-----------|--------|---------|---------|
| `data-theme-variant` | `warm` \| `cold` | Design language (radius, type scale, transitions) | `warm` |
| `data-theme` | `light` \| `dark` | Color mode | `light` (implicit) |

Light is the default with no selector of its own. Dark mode is applied **only** through the compound selector `[data-theme-variant="..."][data-theme="dark"]`. There is no `prefers-color-scheme` media query anywhere in the library — if you want to honor the OS preference, wire it yourself (see the FOUC snippet below). Warm and cold differ in more than color: warm uses an 8px radius / 28px h1 / 0.2s transitions, cold uses 6px / 24px / 0.15s.

Set it statically in your HTML:

```html
<html data-theme-variant="cold" data-theme="dark">
```

### Runtime switching with `ThemeManager`

`ThemeManager` (`ui/utils/theme-manager.ts`) writes exactly those two attributes on `<html>`. Full API:

```ts
import { ThemeManager } from "@monochrome-edge/ui";

const theme = new ThemeManager("warm", "light"); // constructor applies immediately; both args optional (default warm/light)

theme.setTheme("cold");   // data-theme-variant="cold"
theme.setMode("dark");    // data-theme="dark"
theme.toggle();           // flips mode only (light <-> dark), not variant
theme.getTheme();         // -> { theme: "cold", mode: "dark" }
```

> `ThemeManager` has **no persistence** — no `localStorage`, no storage key, no FOUC handling. Restoring a saved theme and preventing flash are your responsibility.

You can also set the attributes directly without the class:

```ts
document.documentElement.setAttribute("data-theme-variant", "cold");
document.documentElement.setAttribute("data-theme", "dark");
```

### FOUC prevention

Because there is no built-in persistence, restore the theme in a **blocking** inline script in `<head>`, before first paint, so the page never flashes the wrong theme:

```html
<head>
  <script>
    // Runs before CSS paints. Reads a saved choice or falls back to OS preference.
    (function () {
      try {
        var variant = localStorage.getItem("me-variant") || "warm";
        var mode =
          localStorage.getItem("me-mode") ||
          (matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
        var el = document.documentElement;
        el.setAttribute("data-theme-variant", variant);
        el.setAttribute("data-theme", mode);
      } catch (e) {}
    })();
  </script>
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@monochrome-edge/ui@latest/dist/monochrome.min.css" />
</head>
```

Then persist on change:

```ts
theme.setMode("dark");
localStorage.setItem("me-mode", theme.getTheme().mode);
```

This inline script requires a CSP accommodation — see §7.

### Customizing tokens

Every color, radius, and spacing value is a CSS custom property. Override them after the library stylesheet loads. Canonical semantic tokens (identical names in both themes) include `--theme-bg`/`--theme-background`, `--theme-surface`, `--theme-border`, `--theme-accent` (+ `-contrast`, `-rgb`, `-alpha`, `-light`), `--theme-text-primary`/`-secondary`/`-tertiary`, and `--theme-shadow-sm`/`md`/`lg`/`xl`. Generic aliases include `--color-primary`, `--color-surface`, `--color-border`, `--color-text`, `--spacing-xs..xl`, `--border-radius-sm`/`-lg`.

```css
/* Load after monochrome.min.css. Scope overrides to the same attributes the
   library uses so warm/cold and light/dark stay independent. */
[data-theme-variant="warm"] {
  --theme-accent: #b5533a;
  --border-radius: 12px;
}
[data-theme-variant="warm"][data-theme="dark"] {
  --theme-surface: #1a1614;
}
```

Gray scales are theme-scoped: `--warm-100..--warm-900` exist only under `[data-theme-variant="warm"]`, `--cool-100..--cool-900` only under cold. `scripts/check-tokens.js` runs in the build and fails if any `var(--x)` used without a fallback is undefined, so keep overrides additive.

---

## 5. Framework recipes

The adapter modules re-export the ThemeManager, presentational components, and (for React/Vue) interactive wrappers around the canonical vanilla classes. Import the CSS once at your app root regardless of framework.

### React

`@monochrome-edge/ui/react` exports `ThemeProvider`/`useTheme`, presentational components (`Button`, `Card`, `Input`, `Modal`, `Table`, `Nav`, `Badge`, form controls, `TOC`, `Breadcrumb`, `IconToggle`, `Changelog`), and — via `export * from "./react-interactive"` — wrappers for the interactive classes.

```tsx
import { ThemeProvider, useTheme, Button, Modal, Card } from "@monochrome-edge/ui/react";
import "@monochrome-edge/ui/css";
import { useState } from "react";

function ThemeSwitch() {
  const { mode, toggleMode, setTheme } = useTheme();
  return (
    <>
      <Button variant="ghost" onClick={toggleMode}>Mode: {mode}</Button>
      <Button variant="secondary" onClick={() => setTheme("cold")}>Cold</Button>
    </>
  );
}

export default function App() {
  const [open, setOpen] = useState(false);
  return (
    <ThemeProvider defaultTheme="warm" defaultMode="light">
      <Card title="Demo">
        <ThemeSwitch />
        <Button onClick={() => setOpen(true)}>Open</Button>
      </Card>
      <Modal isOpen={open} onClose={() => setOpen(false)} title="Hi" size="medium">
        The React Modal traps focus and restores it on close.
      </Modal>
    </ThemeProvider>
  );
}
```

`ThemeProvider` sets `data-theme`/`data-theme-variant` on `<html>` inside a `useEffect`, so the attributes appear after hydration (see SSR notes). The React `Modal` implements its own focus trap and Escape handling — it is a distinct component from the vanilla `Modal` class.

### Vue 3

`@monochrome-edge/ui/vue` mirrors the React surface with `defineComponent`-based components (registered names are prefixed `Mono*`, e.g. `MonoButton`) plus `ThemeProvider`, `useTheme`, and a default export bundling everything.

```vue
<script setup lang="ts">
import { ThemeProvider, Button, Card, Modal, useTheme } from "@monochrome-edge/ui/vue";
import "@monochrome-edge/ui/css";
import { ref } from "vue";

const open = ref(false);
</script>

<template>
  <ThemeProvider :default-theme="'warm'" :default-mode="'light'">
    <Card title="Demo">
      <Button variant="primary" @click="open = true">Open</Button>
    </Card>
    <Modal :is-open="open" title="Hi" size="medium" @close="open = false">
      A Vue-rendered modal.
    </Modal>
  </ThemeProvider>
</template>
```

`ThemeProvider` applies the theme attributes in `onMounted`, and `useTheme()` throws if called outside a `ThemeProvider`. Inputs use `v-model` (`update:modelValue`).

### jQuery

`@monochrome-edge/ui/jquery` registers `$.fn` plugins (all prefixed `mce`). Load jQuery first, then the adapter, then the CSS.

```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@monochrome-edge/ui@latest/dist/monochrome.min.css" />
<script src="https://cdn.jsdelivr.net/npm/jquery@3/dist/jquery.min.js"></script>
<script type="module">
  import "https://cdn.jsdelivr.net/npm/@monochrome-edge/ui@latest/dist/jquery.esm.js";

  $("#save").mceButton({ variant: "primary", onClick: () => $.fn.mceToast || null });
  $("#panel").mceCard({ title: "Card", content: "Body text" });
  $("#dlg").mceModal({ title: "Hello", content: "Body", size: "medium" });
  $.fn.mceToast?.("Saved", "success");
  // Theme control: set | toggle | get
  $(document).mceTheme("set", "cold");
</script>
```

Available plugins: `mceButton`, `mceCard`, `mceModal`, `mceTabs`, `mceAccordion`, `mceToast`, `mceTheme`, `mceIconToggle`, `mceBreadcrumb`. The adapter imports `safeUrl` from `ui/utils/security` and escapes untrusted values.

### Web Components

`@monochrome-edge/ui/web-components` auto-registers custom elements on import (guarded, so importing twice is a no-op). No framework required.

```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@monochrome-edge/ui@latest/dist/monochrome.min.css" />
<script type="module"
  src="https://cdn.jsdelivr.net/npm/@monochrome-edge/ui@latest/dist/web-components.esm.js"></script>

<mce-button variant="primary">Click</mce-button>
<mce-card title="Card">Body content</mce-card>
<mce-badge variant="success">New</mce-badge>
<mce-modal open title="Hello" size="medium">Dialog body</mce-modal>
```

Registered tags: `mce-button`, `mce-card`, `mce-modal`, `mce-tabs`, `mce-accordion`, `mce-input`, `mce-checkbox`, `mce-badge`, `mce-toast`, `mce-icon-toggle`, `mce-breadcrumb`, `mce-breadcrumb-item`, `mce-tree-view`, `mce-graph-view`, `mce-search-toolbar`, `mce-toc`, `mce-toc-item`, `mce-icon-button`. The module also exports `registerMonochromeComponents()`, `showToast()`, and a `ThemeController` static class. This bundle is flagged as having side effects, so it will not be tree-shaken away.

### SSR notes (Next.js / Nuxt)

The library is DOM-oriented. Real caveats found in the code:

- **Theme attributes are applied client-side only.** React `ThemeProvider` sets the attributes in `useEffect`; Vue in `onMounted`. On the server the `<html>` element has no theme attributes, so the first server-rendered paint uses the light/warm CSS defaults until hydration runs. To avoid a flash, set `data-theme-variant`/`data-theme` directly on your server-rendered `<html>` (Next.js: on the `<html>` tag in `app/layout.tsx`; Nuxt: via `app.head` / `useHead` `htmlAttrs`) and/or use the blocking inline script from §4.
- **Interactive vanilla classes touch `document`/`window` in their constructors** (`Modal`, `Dropdown`, `Toast`, `GraphView`, `SearchBar`, etc.). Instantiate them inside `useEffect`/`onMounted`, never during render or on the server. In Next.js, wrap components that call them in a client component (`"use client"`) or a `dynamic(import, { ssr: false })` boundary.
- **SSR-safe by design:** `Stepper` auto-init is guarded by `typeof document`/`DOMContentLoaded`, and the React/Vue `IconToggle` compute an SSR-safe default without reading `document` during render, then sync to the live attributes after mount. These are safe to render on the server.
- **`IconLoader` base path:** on the server (`typeof window === "undefined"`) it falls back to the jsDelivr CDN for long-tail icons. The 25 hot-path icons are inlined and need no network.
- **`MathRenderer` needs a global `window.katex`** — it warns and no-ops if absent, and there is nothing to render server-side. Load KaTeX and render on the client.

---

## 6. Editor quickstart

The editor is a separate bundle. Its entry (`ui/components/editor/index.js`) exports `EditorCore` under the alias `Editor`. Two consumption paths:

### CDN standalone (KaTeX + Prism inlined)

`monochrome-edge-editor.standalone.js` bundles KaTeX and Prism so it works with a single script tag. It exposes `window.MonochromeEditor`.

```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@monochrome-edge/ui@latest/dist/monochrome.min.css" />
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@monochrome-edge/ui@latest/dist/editor.min.css" />
<div id="editor"></div>
<script src="https://cdn.jsdelivr.net/npm/@monochrome-edge/ui@latest/dist/monochrome-edge-editor.standalone.js"></script>
<script>
  const { Editor } = window.MonochromeEditor;
  const editor = new Editor("#editor", {
    placeholder: "Start writing...",
    autoSave: true,
    onSave: (doc) => console.log("Saving", doc),
    onChange: (doc) => console.log("Changed", doc),
  });
</script>
```

### Bundler (external KaTeX/Prism)

The non-standalone bundles (`monochrome-edge-editor.esm.js` / `.min.js`) treat `katex` and `prismjs` as **external** globals (`katex` / `Prism`). Provide them yourself. Since the editor has no package `exports` entry, import it by explicit dist path or copy `ui/components/editor/` into your project:

```ts
// Direct file path — the editor is not exposed as a bare specifier.
import { Editor } from "@monochrome-edge/ui/dist/monochrome-edge-editor.esm.js";
import "@monochrome-edge/ui/dist/editor.min.css";
```

Core methods: `getContent()` → `{ json, markdown, blocks }`, `setContent(...)`, `executeCommand(name)`, `save()`, `destroy()`. See [ui/components/editor/README.md](../ui/components/editor/README.md) for the full options list, keyboard shortcuts, and document-linking/image-upload callbacks, and [ui/components/editor/ARCHITECTURE.md](../ui/components/editor/ARCHITECTURE.md) for internals.

---

## 7. Content-Security-Policy notes

What the library needs from your CSP, based on the actual code:

### Styles

- **`style-src`:** Several behaviors set inline element styles at runtime (e.g. `document.body.style.overflow = "hidden"` when a `Modal` opens; the React/Vue `useToast` fade toasts via `toast.style.opacity`). These are DOM style-property writes, not `<style>` blocks or `style=""` attributes in HTML, so a strict `style-src 'self'` is generally fine. If you inline the library CSS into a `<style>` tag, add a hash or nonce.
- The **React/Vue `IconToggle`** injects trusted, static SVG via `dangerouslySetInnerHTML` / `innerHTML` — this is markup, not script, and needs no `script-src` relaxation. All dynamic user text elsewhere is written through `textContent` or escaped with `ui/utils/security.ts` (`escapeHtml`, `safeUrl`, `highlightSafe`), so it is XSS-safe by default.

### Scripts

- The library ships **no inline scripts**. The only inline script you introduce is the optional **FOUC-prevention snippet** in §4. Under a nonce-based CSP, add a per-request nonce to that `<script>`:

  ```html
  <script nonce="{REQUEST_NONCE}"> /* theme restore */ </script>
  ```

  and include `'nonce-{REQUEST_NONCE}'` in `script-src`.

### Connections and fonts

- **`img-src` / `connect-src`:** `IconLoader` lazily `fetch`es long-tail SVG icons. In non-dev/non-repo contexts its default base path is `https://cdn.jsdelivr.net/npm/@monochrome-edge/ui@latest/dist/assets/icons/`. If you rely on remote icons, allow that origin in `connect-src` (the loader inlines SVG as markup, so it is `connect-src`, not `img-src`). Self-host `dist/assets/icons/` and pass an explicit `basePath` to `new IconLoader(basePath)` to keep everything first-party.
- **`font-src` / `style-src`:** the token files reference the Pretendard / Noto Sans KR font stack by family name but do not `@import` a web font — bring your own font files and allow their origin.

### Suggested starting CSP

```
default-src 'self';
script-src 'self' 'nonce-{REQUEST_NONCE}';
style-src 'self';
img-src 'self' data:;
connect-src 'self' https://cdn.jsdelivr.net;
font-src 'self';
object-src 'none';
base-uri 'self';
```

Drop `https://cdn.jsdelivr.net` from `connect-src` once you self-host icons; add your own font/CDN origins as needed.
