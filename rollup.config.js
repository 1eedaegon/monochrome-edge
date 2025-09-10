import typescript from '@rollup/plugin-typescript';
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import terser from '@rollup/plugin-terser';
import copy from 'rollup-plugin-copy';

const external = ['react', 'react-dom', 'vue', 'jquery'];

export default [
  // Main entry (vanilla JS/TS)
  {
    input: 'src/index.ts',
    output: [
      {
        file: 'dist/index.js',
        format: 'cjs',
        exports: 'named'
      },
      {
        file: 'dist/index.esm.js',
        format: 'es'
      }
    ],
    plugins: [
      typescript({
        declaration: true,
        declarationDir: 'dist',
        rootDir: 'src'
      }),
      resolve(),
      commonjs(),
      terser()
    ]
  },
  // React components
  {
    input: 'src/react.tsx',
    external,
    output: [
      {
        file: 'dist/react.js',
        format: 'cjs',
        exports: 'named'
      },
      {
        file: 'dist/react.esm.js',
        format: 'es'
      }
    ],
    plugins: [
      typescript({
        declaration: true,
        declarationDir: 'dist',
        rootDir: 'src',
        jsx: 'react'
      }),
      resolve(),
      commonjs(),
      terser()
    ]
  }
];