import typescript from '@rollup/plugin-typescript';
import commonjs from '@rollup/plugin-commonjs';
import nodeResolve from '@rollup/plugin-node-resolve';
import inject from '@rollup/plugin-inject';
import replace from '@rollup/plugin-replace';
import json from '@rollup/plugin-json';
import packageJson from '../package.json' with { type: 'json' };
import { RollupOptions, OutputOptions } from 'rollup';
import terser from '@rollup/plugin-terser';

const enableMinification = process.env.MINIFY === 'true';
const base: RollupOptions = {
  logLevel: 'silent',
  watch: {
    exclude: /node_modules/,
  },
  output: {
    dir: 'scripts',
    format: 'iife',
    sourcemap: !enableMinification,
  },
  plugins: [
    replace({
      preventAssignment: true,
      __VERSION__: JSON.stringify(packageJson.version),
      __IS_OPERA__: process.env.BROWSER === 'opera',
    }),
    typescript({
      exclude: [/node_modules/],
      tsconfig: './configs/tsconfig.rollup.json',
      rootDir: '../../',
    }),
    commonjs(),
    json(),
    inject({
      Buffer: ['buffer', 'Buffer'],
    }),
    nodeResolve({ preferBuiltins: false }),
  ],
};
if (enableMinification) {
  (base.output as OutputOptions).plugins = [terser()];
}

export default base;
