import resolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import terser from "@rollup/plugin-terser";
import postcss from "rollup-plugin-postcss";
import alias from "@rollup/plugin-alias";
import typescript from "@rollup/plugin-typescript";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default [
  // ES Module build
  {
    input: "ui/components/editor/index.js",
    output: {
      file: "dist/monochrome-edge-editor.esm.js",
      format: "es",
      sourcemap: true,
    },
    external: ["katex", "prismjs"],
    plugins: [
      alias({
        entries: [
          { find: "@src", replacement: path.resolve(__dirname, "src") },
          { find: "@ui", replacement: path.resolve(__dirname, "ui") },
        ],
      }),
      resolve({
        browser: true,
        preferBuiltins: false,
        extensions: [".js", ".ts", ".json"],
      }),
      typescript({
        declaration: false,
        compilerOptions: {
          target: "es2020",
          module: "esnext",
        },
      }),
      commonjs(),
      postcss({
        extract: "editor-bundle.css",
        minimize: true,
      }),
    ],
  },

  // UMD build (for CDN usage)
  {
    input: "ui/components/editor/index.js",
    output: {
      file: "dist/monochrome-edge-editor.js",
      format: "umd",
      name: "MonochromeEditor",
      sourcemap: true,
      globals: {
        katex: "katex",
        prismjs: "Prism",
      },
    },
    external: ["katex", "prismjs"],
    plugins: [
      alias({
        entries: [
          { find: "@src", replacement: path.resolve(__dirname, "src") },
          { find: "@ui", replacement: path.resolve(__dirname, "ui") },
        ],
      }),
      resolve({
        browser: true,
        preferBuiltins: false,
        extensions: [".js", ".ts", ".json"],
      }),
      typescript({
        declaration: false,
        compilerOptions: {
          target: "es2020",
          module: "esnext",
        },
      }),
      commonjs(),
      postcss({
        extract: false,
        inject: false,
      }),
    ],
  },

  // Minified UMD build
  {
    input: "ui/components/editor/index.js",
    output: {
      file: "dist/monochrome-edge-editor.min.js",
      format: "umd",
      name: "MonochromeEditor",
      sourcemap: false,
      globals: {
        katex: "katex",
        prismjs: "Prism",
      },
    },
    external: ["katex", "prismjs"],
    plugins: [
      alias({
        entries: [
          { find: "@src", replacement: path.resolve(__dirname, "src") },
          { find: "@ui", replacement: path.resolve(__dirname, "ui") },
        ],
      }),
      resolve({
        browser: true,
        preferBuiltins: false,
        extensions: [".js", ".ts", ".json"],
      }),
      typescript({
        declaration: false,
        compilerOptions: {
          target: "es2020",
          module: "esnext",
        },
      }),
      commonjs(),
      postcss({
        extract: false,
        inject: false,
        minimize: true,
      }),
      terser({
        compress: {
          drop_console: true,
          drop_debugger: true,
          pure_funcs: ["console.log", "console.debug"],
        },
        mangle: {
          properties: false,
        },
        format: {
          comments: false,
        },
      }),
    ],
  },

  // Standalone bundle (includes all dependencies)
  {
    input: "ui/components/editor/index.js",
    output: {
      file: "dist/monochrome-edge-editor.standalone.js",
      format: "iife",
      name: "MonochromeEditor",
      sourcemap: false,
    },
    plugins: [
      alias({
        entries: [
          { find: "@src", replacement: path.resolve(__dirname, "src") },
          { find: "@ui", replacement: path.resolve(__dirname, "ui") },
        ],
      }),
      resolve({
        browser: true,
        preferBuiltins: false,
        extensions: [".js", ".ts", ".json"],
      }),
      typescript({
        declaration: false,
        compilerOptions: {
          target: "es2020",
          module: "esnext",
        },
      }),
      commonjs(),
      postcss({
        extract: false,
        inject: true,
        minimize: true,
      }),
      terser(),
    ],
  },
];
