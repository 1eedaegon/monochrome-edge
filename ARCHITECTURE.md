# Architecture

This document describes the system architecture of `@monochrome-edge/ui`: how the library is organized, how CSS tokens and themes combine, how the vanilla-TypeScript behavior layer works, how the framework adapters wrap that core, and how the whole thing is built and released.

For a project overview and quickstart, see [README.md](../README.md). For local development, see [DEVELOPMENT.md](../DEVELOPMENT.md); for contribution rules, see [CONTRIBUTING.md](../CONTRIBUTING.md). The editor is its own subsystem, documented separately in [ui/components/editor/ARCHITECTURE.md](../ui/components/editor/ARCHITECTURE.md).

> Note on versions: `package.json` declares version `1.13.20`, while the `VERSION` constant embedded in `ui/index.ts` and `src/index.ts` reads `1.13.17`. `scripts/update-version.js` syncs those constants, but only on the npm `version` and `postmerge` lifecycles — not on `build` or `prepublishOnly` — so the constant can trail the manifest between releases.

---

## 1. Design philosophy

The library is built around four deliberate constraints.

### Two ways to consume: no-install and npm

`@monochrome-edge/ui` supports both a shadcn-style copy-in model and a conventional package install.

- **No-install / copy-in.** The npm `files` field is `["dist", "ui"]`, so publishing ships not just the built `dist/` output but the entire raw `ui/` source tree (21 `.ts` files and 79 `.css` files). A consumer can copy the CSS or a single component straight out of `ui/` and own it, with no build-time dependency on the package.
- **npm adapters.** The same source is compiled to distributable ESM/CJS/UMD bundles plus per-framework entry points (`./react`, `./vue`, `./jquery`, `./web-components`) and per-component subpaths (`./ui/components/modal`, etc.), so it can also be imported like any normal dependency.

### Dual theme × light/dark

There are two independent axes:

- **Theme variant** — `warm` or `cold`. These are two distinct token sets, not shades of one palette. Warm targets content/CMS surfaces; cold targets denser SaaS/app surfaces. They differ in more than color (radius, type scale, transition timing — see [§3](#3-css-architecture)).
- **Mode** — `light` (default) or `dark`.

The two axes combine into four visual states. Both theme token files ship in every full bundle, so switching is a pure attribute flip with no extra network request.

### Monochrome token discipline

The palette is intentionally near-grayscale. Each theme defines a scoped gray scale (`--warm-100`…`--warm-900` under warm, `--cool-100`…`--cool-900` under cold) plus a small set of muted semantic accents. Status colors (`--color-success/-warning/-error/-info`) are the main chromatic escape hatch and are themselves theme- and mode-specific. A build-time guard (`scripts/check-tokens.js`) enforces that every token referenced without a fallback is actually defined, and that the warm and cold `--theme-*` token *name* sets are identical — so a component styled against the semantic vocabulary renders correctly under either theme.

---

## 2. Repository layout

```text
monochrome-edge/
├── ui/                          # Canonical source: styles + vanilla-TS behaviors (shipped raw to npm)
│   ├── index.ts                 # Public entry: re-exports every TS component + utility + VERSION
│   ├── monochrome-edge.css      # Master stylesheet (@imports the full atomic cascade)
│   │
│   ├── base/                    # reset.css (a11y base, focus-visible, reduced-motion), responsive.css (grid)
│   ├── tokens/                  # warm-theme.css, cold-theme.css — the design-token layer
│   ├── atoms/                   # button, input, label, icon, badge, spinner, breadcrumb, landscape, colors, typography...
│   ├── molecules/               # card, dropdown, toast, tab, search-bar, tree-view, math-renderer, callout, changelog...
│   ├── organisms/               # header, sidebar, modal, data-table, toolbar, footer, timeline, graph-view
│   ├── templates/               # warm-layout, cold-layout, blog-layout
│   ├── utilities/               # spacing, flex, grid
│   │
│   ├── components/              # Second-generation components: colocated <name>.ts + <name>.css
│   │   ├── accordion/  modal/  tabs/  toast/  dropdown/  stepper/
│   │   ├── search-bar/  search-toolbar/  tree-view/  math-renderer/
│   │   ├── graph-view/          # graph-view.ts + graph-builder, barnes-hut-layout, canvas-renderer, quad-tree
│   │   ├── progress/  command/  tree/  tooltip/   # CSS-only (no .ts)
│   │   └── editor/              # Self-contained WYSIWYG editor subsystem (own ARCHITECTURE.md)
│   │
│   ├── utils/                   # theme-manager, icon-loader, icon-data (generated), dom-helpers, security
│   └── assets/                  # icons, images (copied verbatim into dist/assets)
│
├── src/                         # Framework adapters (compiled, NOT shipped raw)
│   ├── index.ts                 # Adapter entry: re-exports ThemeManager only + VERSION
│   ├── react.tsx / react-interactive.tsx
│   ├── vue.ts   / vue-interactive.ts
│   ├── jquery.ts
│   ├── web-components.ts
│   └── icon-toggle-data.ts      # Shared icon-toggle state used by every adapter
│
├── scripts/                     # Build & release tooling (see §7, §8)
│   ├── gen-icon-data.js         # Generates ui/utils/icon-data.ts (inlined hot-path icons)
│   ├── check-tokens.js          # Token-definition + warm/cold name-parity guard
│   ├── rollup-retry.js          # Wraps rollup, retries up to 25× on Node-24 EBADF flakes
│   ├── make-cjs.js              # Copies UMD .js outputs to .cjs siblings
│   ├── update-version.js        # Syncs VERSION constant + docs placeholder from package.json
│   ├── generate-changelog.js
│   └── resolve-version-conflict.js
│
├── dist/                        # Build output (gitignored; see §7 for the full map)
├── rollup.config.js             # Main + per-component + adapter bundles
├── rollup.editor.config.js      # Editor bundles (ESM/UMD/min/standalone)
├── tsconfig.types.json          # .d.ts emit for dist/types
├── tsconfig.ui.json             # Transpiles ui/ .ts sources for the raw ui/ ship
└── package.json                 # Manifest, exports map, build pipeline
```

Two component "generations" coexist under `ui/`: the older atoms/molecules/organisms/templates style layers, and the newer `ui/components/<name>/` folders that colocate a `.css` file with a `.ts` behavior class. `ui/monochrome-edge.css` imports both generations (see [§3](#3-css-architecture)).

---

## 3. CSS architecture

### 3.1 Token layer

`ui/tokens/warm-theme.css` and `ui/tokens/cold-theme.css` each define a full token set. The names are identical across both files (enforced by `check-tokens.js`); only the values differ. Canonical token groups:

| Group | Tokens |
| --- | --- |
| Surfaces / background | `--theme-bg`, `--theme-background`, `--theme-surface`, `--theme-border` |
| Accent | `--theme-accent`, `--theme-accent-contrast`, `--theme-accent-rgb`, `--theme-accent-alpha`, `--theme-accent-light` |
| Secondary | `--theme-secondary`, `--theme-secondary-contrast` |
| Highlight | `--theme-highlight` |
| Text | `--theme-text-primary`, `--theme-text-secondary`, `--theme-text-tertiary`, `--theme-text-emphasis`, `--theme-text-muted` |
| Shadow | `--theme-shadow-color`, `--theme-shadow-sm`, `--theme-shadow-md`, `--theme-shadow-lg`, `--theme-shadow-xl` |
| Status (theme + mode specific) | `--color-success`, `--color-warning`, `--color-error`, `--color-info` and their `--theme-*(-alpha)` mirrors |
| Compat aliases | `--color-surface`, `--color-surface-hover`, `--color-background`, `--color-border`, `--color-primary`(`-contrast`/`-alpha`), `--color-text`, `--color-text-secondary` |
| Type / spacing | `--font-family-sans`, `--font-family-mono`, `--font-size-h1`, `--font-weight-h1`, `--font-size-body`, `--font-size-base`, `--font-size-caption`, `--spacing-xs/sm/md/lg/xl`, `--border-radius`, `--border-radius-sm`, `--border-radius-lg`, `--transition-speed` |
| Gray scale (theme-scoped) | warm: `--warm-100`…`--warm-900`, `--color-wine`, `--color-olive`; cold: `--cool-100`…`--cool-900` |
| Landscape decor | `--landscape-wave-color`, `--landscape-mountain-color`, `--landscape-forest-color`, `--landscape-desert-color` |

`check-tokens.js` currently reports **107 tokens defined / 76 referenced** and passes. Font stacks are identical between themes (Pretendard / Noto Sans KR sans; SFMono / Consolas mono). The `--color-*` names are compatibility aliases that map onto the canonical `--theme-*` palette (e.g. `--color-primary: var(--theme-accent)`) so older component and editor stylesheets keep resolving.

Where warm and cold intentionally diverge beyond color:

| Property | Warm | Cold |
| --- | --- | --- |
| `--border-radius` | 8px | 6px |
| `--font-size-h1` / `--font-weight-h1` | 28px / 700 | 24px / 600 |
| `--font-size-body` | 16px | 15px |
| `--transition-speed` | 0.2s | 0.15s |

### 3.2 Atomic layers

Styles follow an atomic-design cascade, wired together by the master import:

```
base → tokens → atoms → molecules → organisms → templates → utilities → components
```

- **base** — `reset.css` (normalization plus the accessibility base layer: `.sr-only`, a global `:focus-visible` outline of `2px solid var(--theme-text-primary)` offset `2px`, and a global `@media (prefers-reduced-motion: reduce)` block collapsing animation/transition durations to `0.01ms !important`) and `responsive.css` (Bootstrap-style `.container`/`.row`/`.col-*` grid, display utilities, and a `.navbar-toggler` mobile pattern; breakpoints are hardcoded px values 576/768/992/1200/1400).
- **atoms** — smallest building blocks (button, input, badge, spinner, breadcrumb, icon, landscape) plus `colors.css` (`.bg-*`, `.border-*`, overlay utilities, alpha tokens) and `typography.css`.
- **molecules** — composed widgets (card, dropdown, toast, tab, search-bar, tree-view, math-renderer, callout, changelog).
- **organisms** — page-scale structures (header, sidebar, modal, data-table, toolbar, footer, timeline, graph-view).
- **templates** — full-page layouts (`warm-layout`, `cold-layout`, `blog-layout`).
- **utilities** — spacing (`.m-*`/`.p-*`, rem scale 0–4rem), flex, grid — none of which use `!important`.

### 3.3 Import graph of `ui/monochrome-edge.css`

The master stylesheet imports, in order: `base/*`, then **both** token files, then typography and colors, then the atom/molecule/organism/template/utility layers, and finally a block of second-generation `components/*/*.css`. Because both generations are imported, **nine components ship two CSS copies** — a legacy `molecules/`/`organisms/` file and a newer `components/<name>/` file:

`dropdown`, `toast`, `tab(s)`, `search-bar`, `search-toolbar`, `tree-view`, `math-renderer`, `graph-view`, `modal`.

The two copies use different class vocabularies. The vanilla-TS behaviors (see [§4](#4-component-behavior-layer)) emit the **flat-kebab** classes (e.g. `search-bar-input`, `graph-view-canvas`, `dropdown-item`, `toast-container`, `modal is-open`, `tab-panel active`), not the BEM classes (`.search-bar__input`, `.tree-view__item`, `.graph-view__node`) present in some `components/*/` copies. Style against the flat-kebab classes the TS layer actually produces.

Some CSS files exist in the tree (and ship to npm) but are imported by nothing — e.g. `components/tooltip/tooltip.css`, `components/button.css`, `components/form.css`, `organisms/table.css`, `organisms/blog-editor.css`, and the loose editor CSS files. Print styles are local, not global (only `atoms/breadcrumb.css` and the editor stylesheet define `@media print`).

### 3.4 Theming mechanism

Theme selection is driven entirely by two attributes, both set on the **same element** (adapters set them on `document.documentElement`):

| Attribute | Values | Meaning | Default |
| --- | --- | --- | --- |
| `data-theme-variant` | `warm` \| `cold` | Theme variant | `warm` |
| `data-theme` | `light` \| `dark` | Mode | `light` |

The token files are keyed off these attributes:

- Light values live under the single-attribute selector `[data-theme-variant="warm"]` (and `...="cold"`). **Light is the default — there is no `[data-theme="light"]` selector.**
- Dark values live under the compound selector `[data-theme-variant="warm"][data-theme="dark"]` (and the cold equivalent), which overrides the light values when `data-theme="dark"` is present.

There is **no `prefers-color-scheme` media query anywhere** in `ui/`, and no automatic dark-mode adoption; the mode is always explicit. To switch themes at runtime you flip these attributes (directly, or via `ThemeManager` / an adapter's theme provider).

```html
<html data-theme-variant="cold" data-theme="dark">
  <!-- cold theme, dark mode -->
</html>
```

---

## 4. Component behavior layer

Interactive behavior lives in a set of small vanilla-TypeScript classes under `ui/components/*/`. They have no framework dependency and manipulate the DOM and CSS classes directly.

### 4.1 The pattern

- **Constructor.** Two conventions coexist. Most class-per-container components take `(container: HTMLElement | string, options)` — Accordion, Modal, Tabs, Dropdown, Stepper, SearchToolbar. The rendering/data-heavy ones take a single options object with a `container` field — SearchBar, TreeView, GraphView, MathRenderer.
- **Options.** Each class accepts a typed options object with defaults merged in; callbacks (`onToggle`, `onChange`, `onSelect`, …) are part of the options.
- **State via CSS classes.** State is expressed by toggling classes (`is-open`, `active`, `is-active`, `is-expanded`) rather than inline styles, so styling stays in CSS.
- **`destroy()`.** Every class exposes a public `destroy()` that detaches listeners and cleans up (document-level Escape/click listeners, ResizeObservers, appended popups). `Toast` is the exception: it is entirely static — `Toast.show/success/error/info/warning/dismiss/clearAll`, no instances.
- **Auto-init.** A subset supports declarative init via data attributes (`[data-accordion]`, `[data-dropdown]`, `[data-modal]`, `[data-tabs]`, `[data-stepper]`); each `initX()` guard sets `data-<name>-initialized="true"`. Only `initSteppers` is exported from `ui/index.ts`, and only `Stepper` auto-runs on import (DOMContentLoaded-guarded, SSR-safe).

### 4.2 The TS components

Exported from `ui/index.ts` (`VERSION` plus the classes):

| Component | Constructor | Notable API |
| --- | --- | --- |
| `Accordion` | `(container, options)` | `allowMultiple`, `defaultOpen`, `onToggle`; `toggle/open/close/openAll/closeAll/destroy`; open state = `is-open` on `.accordion-item` |
| `Modal` | `(container, options)` | `closeOnBackdrop`, `closeOnEscape`, `onOpen/onClose`; `open/close/toggle/isModalOpen/destroy`; `.is-open` class, `[data-modal-close]` trigger, sets `body overflow:hidden` while open |
| `Tabs` | `(container, options)` | `.tab` buttons, `.tab-panel` panels, `active` state; `switchTo/next/prev/getCurrentIndex/getTabCount/destroy`; `onChange(index, tabId)` fires once for the default tab |
| `Dropdown` | `(container, options)` | menu from `data-dropdown-target` or `nextElementSibling`; `closeOnSelect`, `placement`, `offset`; `is-open` (menu) / `is-active` (trigger); outside-click closes |
| `Stepper` | `(container, options)` | reads `data-type/-layout/-show-progress` (+ legacy `data-mode`); renders an SVG (`.stepper-svg`) + a `.stepper-popup` appended to `body`; re-renders via ResizeObserver; `updateStep(index, state)`; states `pending\|active\|completed\|failed\|error` |
| `Toast` (static) | — | `Toast.show(message, options)` (`duration`, `position`, `type`, `closable`); creates `.toast-container[data-position]` with `role=status`/`aria-live=polite`; errors get `role=alert` |
| `SearchBar` | `({ container, ... })` | substring scorer (title +10 / content +5 / tags +3 — not FlexSearch despite naming); input gets `role=combobox`; `clear/addDocument/removeDocument/updateDocuments/destroy` |
| `SearchToolbar` | `(container, options)` | `debounceMs` 300; autocomplete accepts `string[]` or async fn; filter/sort buttons toggle `is-active`; also assigns `window.SearchToolbar`; `clear/getQuery/getFilters/getSort/setResultsCount/destroy` |
| `TreeView` | `({ container, data, ... })` | classes `tree-view`/`tree-item`/`tree-toggle`(`is-expanded`); toggle sets `aria-expanded`; expand state written back into caller's `TreeNode` objects |
| `GraphView` | `({ container, ... })` | force-directed graph on a `<canvas class="graph-view-canvas">`; `runLayout/stopLayout/resetLayout/updateDocuments/getStats/resize/resetView/render/destroy`; ResizeObserver-driven |
| `DocumentGraph` | data class | maps string doc ids → integer ids, forward/backward adjacency as `Uint32Array`; `getStats()` returns node/edge counts + degree stats |
| `BarnesHutLayout` | layout engine | `theta` 0.5, `damping` 0.3, `initialAlpha` 1.0…; `simulate(onProgress)` runs the whole iteration loop internally |
| `CanvasRenderer` / `QuadTree` | graph internals | renderer handles drag-pan, wheel + pinch zoom (clamped 0.1–3); QuadTree backs Barnes–Hut |
| `MathRenderer` (+ `renderAllMath`) | `({ container, ... })` | requires global `window.katex` (KaTeX is not bundled — warns and no-ops if absent); default selectors `.math-inline` / `.math-display` |

Supporting utilities also exported from `ui/index.ts`:

- `ThemeManager` — see [§3.4](#34-theming-mechanism) / [§5](#5-adapter-architecture).
- `IconLoader` / `iconLoader` — async SVG loader; 25 hot-path icons are inlined in `ui/utils/icon-data.ts` (generated by `scripts/gen-icon-data.js`) and seed the cache; default `basePath` resolves to a local path on localhost, otherwise the jsDelivr CDN.
- `security` helpers (`escapeHtml`, `escapeRegExp`, `safeUrl`, `highlightSafe`) — `safeUrl` allows only `http/https/mailto/tel` and relative/anchor URLs (else `#`); `highlightSafe` escapes text and query before wrapping matches in `<mark>`. Consumed by `search-bar`, `search-toolbar`, and the jQuery / Web-Components adapters.
- `dom-helpers` (`createButton`, `createCard`, `showToast`, TOC/changelog helpers).

---

## 5. Adapter architecture

The `src/` directory contains four framework adapters. Each wraps the same canonical `ui/` classes and CSS — they add framework-idiomatic surfaces, they do not reimplement behavior. Every adapter sets the same two theme attributes on `document.documentElement`, so theming is consistent across all of them.

`src/index.ts` is intentionally thin: it re-exports only `ThemeManager` (and `VERSION`) and directs consumers to the per-framework subpaths.

| Adapter | Entry point | External peer(s) | Exposes |
| --- | --- | --- | --- |
| React | `src/react.tsx` (+ `react-interactive.tsx`) | `react`, `react-dom`, `react/jsx-runtime` | `ThemeProvider` / `useTheme` context (theme `warm\|cold` + mode `light\|dark`), presentational components, and `react-interactive` wrappers around the vanilla classes (Accordion, Tabs, Dropdown, SearchBar, SearchToolbar, TreeView, Stepper, Math, GraphView) so the full library surfaces from one import |
| Vue | `src/vue.ts` (+ `vue-interactive.ts`) | `vue` | `ThemeProvider`/`useTheme`, `useToast`, and `defineComponent`-based wrappers (Button, Card, Input, Modal, Table*, Nav*, Select, Badge, Checkbox, Radio, FormGroup, TOC, Changelog, IconToggle, Breadcrumb…); re-exports `ThemeManager` and `vue-interactive` |
| jQuery | `src/jquery.ts` | `jquery` | `$.fn` plugins prefixed `mce*`: `mceButton`, `mceCard`, `mceModal`, `mceTabs`, `mceAccordion`, `mceToast`, `mceTheme`, `mceIconToggle`, `mceBreadcrumb` |
| Web Components | `src/web-components.ts` | none (uses native Custom Elements) | Custom elements prefixed `mce-`: `mce-button`, `mce-card`, `mce-modal`, `mce-tabs`, `mce-accordion`, `mce-input`, `mce-checkbox`, `mce-badge`, `mce-toast`, `mce-icon-toggle`, `mce-breadcrumb(-item)`, `mce-tree-view`, `mce-graph-view`, `mce-search-toolbar`, `mce-toc(-item)`, `mce-icon-button` |

Adapter notes:

- **Web Components** register via `registerMonochromeComponents()`, which guards every `customElements.define` so registering twice (two bundles on one page) is a no-op rather than a `DOMException`. Registration auto-runs on import when `window` is present and `mce-button` is not already defined. The `mce-icon-button` element only loads icons whose name matches `/^[a-z0-9-]+$/i`, so the `icon` attribute cannot point the loader at an arbitrary remote SVG.
- **Peers are externalized, not bundled.** The rollup `external` list is `["react","react-dom","vue","jquery"]`; each adapter bundle imports its peer rather than inlining it. `package.json` declares `peerDependenciesMeta` (all optional) but has **no `peerDependencies` block** — the peers are advisory/optional, so installing only the framework you use is enough.

---

## 6. Editor subsystem

`ui/components/editor/` is a self-contained, local-first WYSIWYG editor, built and bundled independently of the main UI library. It is not part of the main `ui/index.ts` export surface and has no `exports` subpath — its bundles are only matched by the `sideEffects` glob (see [§7](#7-build-pipeline)).

At a glance:

- **Core** — a `contenteditable`-based WYSIWYG engine with a custom block system (`Block` base class with `render`/`toMarkdown`/`fromMarkdown`), selection/range management, and undo/redo history.
- **Features** — 12 essential capabilities: H1–H4 headings, bold/italic/strikethrough, quote, links with preview, image upload, code blocks (syntax highlighting via Prism), LaTeX math (KaTeX), lists (bullet/numbered/checkbox), tables, and document linking.
- **Storage** — local-first with an IndexedDB → LocalStorage → File System API priority chain.
- **Commands** — a centralized `CommandManager` (`editor.execute('bold')`, `editor.execute('insertImage', {...})`).
- **Build** — its own rollup config emits ESM, UMD, minified, and a `standalone` IIFE that inlines KaTeX and Prism (the non-standalone builds treat `katex`/`prismjs` as externals). Its CSS builds to `dist/editor.min.css`. Global name for the editor bundles is `MonochromeEditor` (vs `MonochromeEdge` for the main library).

For the full block model, command flow, storage schema, and phase plan, see **[ui/components/editor/ARCHITECTURE.md](../ui/components/editor/ARCHITECTURE.md)**.

---

## 7. Build pipeline

`npm run build` runs these steps in order:

| # | Script | What it does |
| --- | --- | --- |
| 1 | `clean` | `rm -rf dist` |
| 2 | `gen:icons` | `scripts/gen-icon-data.js` regenerates `ui/utils/icon-data.ts` (inlined hot-path icons) |
| 3 | `build:css` → `minify:css` | PostCSS builds four CSS bundles (below) with `postcss-import` + `cssnano` |
| 4 | `check:tokens` | `scripts/check-tokens.js` fails the build if any no-fallback `var(--token)` is undefined, or if warm/cold `--theme-*` name sets differ |
| 5 | `build:js` | `scripts/rollup-retry.js rollup.config.js` — main + per-component + adapter bundles |
| 6 | `build:editor` | `build:editor:bundle` (rollup, retry-wrapped) then `build:editor:minify` (terser) |
| 7 | `build:ui-sources` | `tsc -p tsconfig.ui.json` — transpiles `ui/` `.ts` sources for the raw ui/ ship |
| 8 | `copy:ui-assets` | `cpy` copies every non-`.ts` file (and `.d.ts`) from `ui/` into `dist/ui` |
| 9 | `copy:assets` | copies `ui/assets/**` into `dist/assets` |
| 10 | `build:types` | `tsc -p tsconfig.types.json` — emits `.d.ts` into `dist/types` |
| 11 | `make:cjs` | `scripts/make-cjs.js` copies UMD `.js` outputs to `.cjs` siblings |

`prepublishOnly` runs the full `build`.

### Rollup configs

- **`rollup.config.js`** — transpiles TS with `rollup-plugin-esbuild` (not `@rollup/plugin-typescript`) and sets `maxParallelFileOps: 1` on every config to dodge Node-24 EBADF write flakes. It emits:
  - `dist/ui.js` (UMD, global `MonochromeEdge`) and `dist/ui.esm.js` (ESM) from `ui/index.ts`.
  - Per-component `dist/ui/components/<name>.js` (UMD) + `.esm.js` (ESM).
  - Adapter bundles `dist/{react,vue,jquery,web-components,index}.{esm.js,cjs}`, with peers externalized.
- **`rollup.editor.config.js`** — emits `dist/monochrome-edge-editor.esm.js`, `.js` (UMD), `.min.js`, and `.standalone.js` (IIFE, inlines KaTeX/Prism), all named `MonochromeEditor`.

Both `build:js` and `build:editor:bundle` run through `scripts/rollup-retry.js`, which retries up to **25 times** but only on `EBADF` errors — any other failure is forwarded immediately.

### dist/ output map

```text
dist/
├── ui.js / ui.esm.js / ui.cjs        # main bundle (UMD / ESM / CJS)
├── react.esm.js / react.cjs
├── vue.esm.js / vue.cjs
├── jquery.esm.js / jquery.cjs
├── web-components.esm.js / web-components.cjs
├── index.esm.js / index.cjs
├── ui/components/<name>.js / .esm.js / .cjs      # per-component bundles
├── monochrome.min.css                # full bundle (from ui/monochrome-edge.css)
├── warm-theme.min.css                # token-only (from ui/tokens/warm-theme.css)
├── cold-theme.min.css                # token-only (from ui/tokens/cold-theme.css)
├── editor.min.css                    # editor styles (from ui/components/editor/styles/editor.css)
├── monochrome-edge-editor.{esm.js,js,min.js,standalone.js}
├── assets/                           # copied icons/images
├── ui/                               # raw ui/ non-TS files (CSS, .d.ts) + transpiled JS
└── types/                            # emitted .d.ts (types entry: dist/types/ui/index.d.ts)
```

`dist/` and `test-results/` are gitignored — neither has tracked files.

### ESM / CJS / types strategy

Because the package is `"type": "module"`, `.js` files are ESM by default. To make `require()` work, `scripts/make-cjs.js` copies each UMD `.js` (the main bundle and every non-`.esm.js` per-component bundle) to a byte-identical `.cjs` sibling — `dist/ui.cjs` is a copy of `dist/ui.js`. Every export subpath therefore provides three targets: `types` (`.d.ts` from `tsconfig.types.json`), `import` (`.esm.js`), and `require` (`.cjs`). The `exports` map covers `.`, `./ui`, ten `./ui/components/*` subpaths, the four framework adapters, and `./css` / `./warm` / `./cold` / `./assets/*`.

Consumer-facing notes:

- `stepper` is compiled and typed but has **no `exports` subpath** — it is reachable via the main bundle, not as `@monochrome-edge/ui/ui/components/stepper`.
- `progress`, `command`, `tooltip`, and `tree` ship **CSS only** (no compiled JS).
- `sideEffects` is `["**/*.css", "**/web-components*.js", "**/web-components*.cjs", "**/monochrome-edge-editor*.js"]`, so `ui.esm.js` and the per-component ESM bundles are tree-shakeable, while CSS, the Web-Components adapter, and the editor bundles are preserved.
- `engines` requires `node >= 24.0.0`. There is no root `.npmrc`, so this is advisory (not `engine-strict`) for consumers. `optionalDependencies` pins only `@esbuild/darwin-arm64`; esbuild otherwise arrives transitively via `rollup-plugin-esbuild`.

---

## 8. Versioning & release

Releases are automated by `.github/workflows/release.yml` and use **npm Trusted Publishing (OIDC)** — the workflow has `id-token: write`, upgrades npm to an OIDC-capable version, and publishes with no `NPM_TOKEN`. It also publishes to GitHub Packages under `@1eedaegon/monochrome-edge` using `NODE_AUTH_TOKEN=GITHUB_TOKEN`.

The release model is **git-first catch-up**:

- If the version in `package.json` is not yet on npm, that exact version is published as-is (no bump).
- Only if that version already exists on npm does the workflow compute and commit a new version.

Version-syncing scripts:

- `scripts/update-version.js` copies the `package.json` version into the `VERSION` constant in `ui/index.ts` and `src/index.ts` and into the version placeholder in `docs/index.html`. It is wired to the npm `version` lifecycle and `postmerge` — **not** to `build` or `prepublishOnly` — which is why the embedded `VERSION` constant can lag the manifest between releases.
- `scripts/generate-changelog.js` runs on the `version` lifecycle; `scripts/resolve-version-conflict.js` handles version-conflict resolution.

CI note: `pr-check.yml` only validates Conventional Commit message format and adds a version-impact label — it runs no build, typecheck, or tests. `deploy-pages.yml` deploys `docs/` to GitHub Pages.
