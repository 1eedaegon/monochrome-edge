import resolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import terser from "@rollup/plugin-terser";
import alias from "@rollup/plugin-alias";
import esbuild from "rollup-plugin-esbuild";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const external = ["react", "react-dom", "vue", "jquery"];

// Shared TS→JS transpile plugin. We use esbuild rather than
// @rollup/plugin-typescript because the latter drives TypeScript's synchronous
// ts.sys file I/O, which collides with Node 24's async libuv FD handling and
// throws intermittent "EBADF: bad file descriptor" mid-build. esbuild has no
// such issue. Type declarations are emitted separately by `build:types`
// (tsconfig.types.json → dist/types), which is what the exports "types"
// conditions point at, so dropping the plugin's per-config .d.ts is safe.
const transpile = () =>
  esbuild({
    include: /\.[jt]sx?$/,
    exclude: /node_modules/,
    sourceMap: false,
    minify: false,
    target: "es2022",
    tsconfig: false,
    loaders: { ".ts": "ts", ".tsx": "tsx" },
  });

// Helper function to create component config
const createComponentConfig = (name, inputPath) => ({
  input: inputPath,
  output: [
    {
      // Browser <script> CDN entry — referenced as a .js URL, keep .js. The CJS
      // require() entry (${name}.cjs) is produced by scripts/make-cjs.js copying
      // this UMD output (.cjs forces CommonJS under "type":"module").
      file: `dist/ui/components/${name}.js`,
      format: "umd",
      name: "MonochromeEdge",
      exports: "named",
    },
    {
      // ESM build so bundler-based consumers (Vite/webpack/Rollup) can
      // tree-shake the per-component subpaths instead of pulling the UMD.
      file: `dist/ui/components/${name}.esm.js`,
      format: "es",
    },
  ],
  plugins: [
    alias({
      entries: [{ find: "@ui", replacement: path.resolve(__dirname, "ui") }],
    }),
    transpile(),
    resolve(),
    commonjs(),
    terser(),
  ],
});

const configs = [
  // ========================================
  // A. UI Components - Individual Builds (UMD for CDN)
  // ========================================
  // Each component needs its own config to avoid code-splitting with UMD format
  createComponentConfig("search-bar", "ui/components/search-bar/search-bar.ts"),
  createComponentConfig(
    "search-toolbar",
    "ui/components/search-toolbar/search-toolbar.ts",
  ),
  createComponentConfig("tree-view", "ui/components/tree-view/tree-view.ts"),
  createComponentConfig("graph-view", "ui/components/graph-view/graph-view.ts"),
  createComponentConfig(
    "math-renderer",
    "ui/components/math-renderer/math-renderer.ts",
  ),
  createComponentConfig("stepper", "ui/components/stepper/stepper.ts"),
  createComponentConfig("accordion", "ui/components/accordion/accordion.ts"),
  createComponentConfig("modal", "ui/components/modal/modal.ts"),
  createComponentConfig("tabs", "ui/components/tabs/tabs.ts"),
  createComponentConfig("toast", "ui/components/toast/toast.ts"),
  createComponentConfig("dropdown", "ui/components/dropdown/dropdown.ts"),

  // ========================================
  // B. UI Integrated Bundle (UMD + ESM)
  // ========================================
  {
    input: "ui/index.ts",
    output: [
      {
        // Browser <script> CDN entry (window.MonochromeEdge). Referenced as a
        // .js URL by the README/demo, so the extension must stay .js. The CJS
        // require() entry (dist/ui.cjs) is produced by scripts/make-cjs.js
        // copying this UMD output — under "type":"module" the .js is parsed as
        // ESM and exposes nothing to require(); the .cjs sibling forces CJS.
        file: "dist/ui.js",
        format: "umd",
        name: "MonochromeEdge",
        exports: "named",
      },
      {
        file: "dist/ui.esm.js",
        format: "es",
      },
    ],
    plugins: [
      alias({
        entries: [{ find: "@ui", replacement: path.resolve(__dirname, "ui") }],
      }),
      transpile(),
      resolve(),
      commonjs(),
      terser(),
    ],
  },

  // ========================================
  // C. React Wrapper
  // ========================================
  {
    input: "src/react.tsx",
    external: [...external, "react/jsx-runtime"],
    output: [
      {
        file: "dist/react.cjs",
        format: "cjs",
        exports: "named",
      },
      {
        file: "dist/react.esm.js",
        format: "es",
      },
    ],
    plugins: [
      alias({
        entries: [
          { find: "@src", replacement: path.resolve(__dirname, "src") },
          { find: "@ui", replacement: path.resolve(__dirname, "ui") },
        ],
      }),
      esbuild({
        include: /\.[jt]sx?$/,
        exclude: /node_modules/,
        sourceMap: false,
        minify: false,
        target: "es2022",
        jsx: "automatic",
        jsxImportSource: "react",
        tsconfig: false,
        loaders: {
          ".tsx": "tsx",
          ".ts": "ts",
        },
      }),
      resolve({
        extensions: [".js", ".ts", ".tsx"],
      }),
      commonjs(),
      terser(),
    ],
  },

  // ========================================
  // D. Vue Wrapper
  // ========================================
  {
    input: "src/vue.ts",
    external: [...external],
    output: [
      {
        file: "dist/vue.cjs",
        format: "cjs",
        exports: "named",
      },
      {
        file: "dist/vue.esm.js",
        format: "es",
      },
    ],
    plugins: [
      alias({
        entries: [
          { find: "@src", replacement: path.resolve(__dirname, "src") },
          { find: "@ui", replacement: path.resolve(__dirname, "ui") },
        ],
      }),
      transpile(),
      resolve({
        extensions: [".js", ".ts", ".tsx"],
      }),
      commonjs(),
      terser(),
    ],
  },

  // ========================================
  // E. jQuery Plugin
  // ========================================
  {
    input: "src/jquery.ts",
    external: [...external],
    output: [
      {
        file: "dist/jquery.cjs",
        format: "cjs",
        exports: "named",
      },
      {
        file: "dist/jquery.esm.js",
        format: "es",
      },
    ],
    plugins: [
      alias({
        entries: [
          { find: "@src", replacement: path.resolve(__dirname, "src") },
          { find: "@ui", replacement: path.resolve(__dirname, "ui") },
        ],
      }),
      transpile(),
      resolve({
        extensions: [".js", ".ts", ".tsx"],
      }),
      commonjs(),
      terser(),
    ],
  },

  // ========================================
  // F. Web Components
  // ========================================
  {
    input: "src/web-components.ts",
    output: [
      {
        file: "dist/web-components.cjs",
        format: "cjs",
        exports: "named",
      },
      {
        file: "dist/web-components.esm.js",
        format: "es",
      },
    ],
    plugins: [
      alias({
        entries: [
          { find: "@src", replacement: path.resolve(__dirname, "src") },
          { find: "@ui", replacement: path.resolve(__dirname, "ui") },
        ],
      }),
      transpile(),
      resolve({
        extensions: [".js", ".ts", ".tsx"],
      }),
      commonjs(),
      terser(),
    ],
  },

  // ========================================
  // G. src/index.ts - Re-exports for framework wrappers
  // ========================================
  {
    input: "src/index.ts",
    output: [
      {
        file: "dist/index.cjs",
        format: "cjs",
        exports: "named",
      },
      {
        file: "dist/index.esm.js",
        format: "es",
      },
    ],
    plugins: [
      alias({
        entries: [
          { find: "@src", replacement: path.resolve(__dirname, "src") },
          { find: "@ui", replacement: path.resolve(__dirname, "ui") },
        ],
      }),
      transpile(),
      resolve({
        extensions: [".js", ".ts", ".tsx"],
      }),
      commonjs(),
      terser(),
    ],
  },
];

// Serialize rollup's own output-file writes. Node 24 intermittently throws
// "EBADF: bad file descriptor, write" from rollup's parallel write queue
// (Queue.work) when many bundles emit at once. Capping to one file op at a time
// trades a little speed for a reliable, non-flaky build.
export default configs.map((c) => ({ maxParallelFileOps: 1, ...c }));
