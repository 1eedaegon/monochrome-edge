import typescript from "@rollup/plugin-typescript";
import resolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import terser from "@rollup/plugin-terser";
import alias from "@rollup/plugin-alias";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const external = ["react", "react-dom", "vue", "jquery"];

export default [
  // Main entry (vanilla JS/TS)
  {
    input: "src/index.ts",
    output: [
      {
        file: "dist/index.js",
        format: "cjs",
        exports: "named",
        inlineDynamicImports: true,
      },
      {
        file: "dist/index.esm.js",
        format: "es",
        inlineDynamicImports: true,
      },
    ],
    plugins: [
      alias({
        entries: [
          { find: "@", replacement: path.resolve(__dirname, "ui") },
          {
            find: "@components",
            replacement: path.resolve(__dirname, "ui/components"),
          },
          { find: "@utils", replacement: path.resolve(__dirname, "ui/utils") },
          {
            find: "@assets",
            replacement: path.resolve(__dirname, "ui/assets"),
          },
        ],
      }),
      typescript({
        declaration: true,
        declarationDir: "dist",
        rootDir: "src",
      }),
      resolve(),
      commonjs(),
      terser(),
    ],
  },
  // React components
  {
    input: "src/react.tsx",
    external,
    output: [
      {
        file: "dist/react.js",
        format: "cjs",
        exports: "named",
        inlineDynamicImports: true,
      },
      {
        file: "dist/react.esm.js",
        format: "es",
        inlineDynamicImports: true,
      },
    ],
    plugins: [
      typescript({
        declaration: true,
        declarationDir: "dist",
        rootDir: "src",
        jsx: "react",
      }),
      resolve(),
      commonjs(),
      terser(),
    ],
  },
  // Vue components
  {
    input: "src/vue.ts",
    external,
    output: [
      {
        file: "dist/vue.js",
        format: "cjs",
        exports: "named",
        inlineDynamicImports: true,
      },
      {
        file: "dist/vue.esm.js",
        format: "es",
        inlineDynamicImports: true,
      },
    ],
    plugins: [
      alias({
        entries: [
          { find: "@", replacement: path.resolve(__dirname, "ui") },
          {
            find: "@components",
            replacement: path.resolve(__dirname, "ui/components"),
          },
          { find: "@utils", replacement: path.resolve(__dirname, "ui/utils") },
          {
            find: "@assets",
            replacement: path.resolve(__dirname, "ui/assets"),
          },
        ],
      }),
      typescript({
        declaration: true,
        declarationDir: "dist",
        rootDir: "src",
      }),
      resolve(),
      commonjs(),
      terser(),
    ],
  },
  // jQuery plugins
  {
    input: "src/jquery.ts",
    external,
    output: [
      {
        file: "dist/jquery.js",
        format: "cjs",
        exports: "named",
        inlineDynamicImports: true,
      },
      {
        file: "dist/jquery.esm.js",
        format: "es",
        inlineDynamicImports: true,
      },
    ],
    plugins: [
      alias({
        entries: [
          { find: "@", replacement: path.resolve(__dirname, "ui") },
          {
            find: "@components",
            replacement: path.resolve(__dirname, "ui/components"),
          },
          { find: "@utils", replacement: path.resolve(__dirname, "ui/utils") },
          {
            find: "@assets",
            replacement: path.resolve(__dirname, "ui/assets"),
          },
        ],
      }),
      typescript({
        declaration: true,
        declarationDir: "dist",
        rootDir: "src",
      }),
      resolve(),
      commonjs(),
      terser(),
    ],
  },
  // Web Components
  {
    input: "src/web-components.ts",
    output: [
      {
        file: "dist/web-components.js",
        format: "cjs",
        exports: "named",
        inlineDynamicImports: true,
      },
      {
        file: "dist/web-components.esm.js",
        format: "es",
        inlineDynamicImports: true,
      },
    ],
    plugins: [
      alias({
        entries: [
          { find: "@", replacement: path.resolve(__dirname, "ui") },
          {
            find: "@components",
            replacement: path.resolve(__dirname, "ui/components"),
          },
          { find: "@utils", replacement: path.resolve(__dirname, "ui/utils") },
          {
            find: "@assets",
            replacement: path.resolve(__dirname, "ui/assets"),
          },
        ],
      }),
      typescript({
        declaration: true,
        declarationDir: "dist",
        rootDir: "src",
      }),
      resolve(),
      commonjs(),
      terser(),
    ],
  },
];
