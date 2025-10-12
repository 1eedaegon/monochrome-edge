import typescript from "@rollup/plugin-typescript";
import resolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import terser from "@rollup/plugin-terser";
import alias from "@rollup/plugin-alias";
import esbuild from "rollup-plugin-esbuild";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const external = ["react", "react-dom", "vue", "jquery"];

// Helper function to create component config
const createComponentConfig = (name, inputPath) => ({
  input: inputPath,
  output: {
    file: `dist/ui/components/${name}.js`,
    format: "umd",
    name: "MonochromeEdge",
    exports: "named",
  },
  plugins: [
    alias({
      entries: [{ find: "@ui", replacement: path.resolve(__dirname, "ui") }],
    }),
    typescript({
      declaration: true,
      declarationDir: "dist/ui/components",
      rootDir: "ui",
      compilerOptions: {
        outDir: "dist/ui/components",
      },
    }),
    resolve(),
    commonjs(),
    terser(),
  ],
});

export default [
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
      typescript({
        declaration: false, // Skip declaration for integrated bundle
        rootDir: "ui",
      }),
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
        file: "dist/react.js",
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
        file: "dist/vue.js",
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
      typescript({
        declaration: false, // Skip declaration - imports from ui/ which has its own
        tsconfig: false, // Don't use tsconfig for cross-directory imports
        include: ["src/**/*", "ui/**/*"],
        exclude: ["src/react.tsx"], // Exclude React wrapper (built separately with esbuild)
        compilerOptions: {
          target: "es2022",
          module: "esnext",
          moduleResolution: "node",
          allowSyntheticDefaultImports: true,
          esModuleInterop: true,
          baseUrl: ".",
          paths: {
            "@src/*": ["src/*"],
            "@ui/*": ["ui/*"],
          },
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
  // E. jQuery Plugin
  // ========================================
  {
    input: "src/jquery.ts",
    external: [...external],
    output: [
      {
        file: "dist/jquery.js",
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
      typescript({
        declaration: false, // Skip declaration - imports from ui/ which has its own
        declarationMap: false,
        tsconfig: false,
        include: ["src/**/*", "ui/**/*"],
        exclude: ["src/react.tsx"], // Exclude React wrapper
        compilerOptions: {
          target: "es2022",
          module: "esnext",
          moduleResolution: "node",
          allowSyntheticDefaultImports: true,
          esModuleInterop: true,
          baseUrl: ".",
          paths: {
            "@src/*": ["src/*"],
            "@ui/*": ["ui/*"],
          },
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
  // F. Web Components
  // ========================================
  {
    input: "src/web-components.ts",
    output: [
      {
        file: "dist/web-components.js",
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
      typescript({
        declaration: false, // Skip declaration - imports from ui/ which has its own
        declarationMap: false,
        tsconfig: false,
        include: ["src/**/*", "ui/**/*"],
        exclude: ["src/react.tsx"], // Exclude React wrapper
        compilerOptions: {
          target: "es2022",
          module: "esnext",
          moduleResolution: "node",
          allowSyntheticDefaultImports: true,
          esModuleInterop: true,
          baseUrl: ".",
          paths: {
            "@src/*": ["src/*"],
            "@ui/*": ["ui/*"],
          },
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
  // G. src/index.ts - Re-exports for framework wrappers
  // ========================================
  {
    input: "src/index.ts",
    output: [
      {
        file: "dist/index.js",
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
      typescript({
        declaration: false,
        declarationMap: false,
        tsconfig: false,
        include: ["src/**/*", "ui/**/*"],
        exclude: ["src/react.tsx"], // Exclude React wrapper (built separately with esbuild)
        compilerOptions: {
          target: "es2022",
          module: "esnext",
          moduleResolution: "node",
          allowSyntheticDefaultImports: true,
          esModuleInterop: true,
          baseUrl: ".",
          paths: {
            "@src/*": ["src/*"],
            "@ui/*": ["ui/*"],
          },
        },
      }),
      resolve({
        extensions: [".js", ".ts", ".tsx"],
      }),
      commonjs(),
      terser(),
    ],
  },
];
