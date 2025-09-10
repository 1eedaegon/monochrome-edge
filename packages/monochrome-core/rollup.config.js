import typescript from 'rollup-plugin-typescript2';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import terser from '@rollup/plugin-terser';
import postcss from 'rollup-plugin-postcss';

const packageJson = require('./package.json');

export default {
  input: 'src/index.ts',
  output: [
    {
      file: packageJson.main,
      format: 'cjs',
      sourcemap: true,
    },
    {
      file: packageJson.module,
      format: 'esm',
      sourcemap: true,
    },
    {
      file: 'dist/monochrome.min.js',
      format: 'iife',
      name: 'Monochrome',
      sourcemap: true,
      plugins: [terser()]
    }
  ],
  plugins: [
    postcss({
      extract: true,
      minimize: true,
      sourceMap: true
    }),
    nodeResolve(),
    commonjs(),
    typescript({
      tsconfig: './tsconfig.json',
      clean: true
    })
  ],
  external: []
};