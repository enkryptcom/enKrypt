import typescript from "@rollup/plugin-typescript";
import commonjs from "@rollup/plugin-commonjs";
import nodeResolve from "@rollup/plugin-node-resolve";
import json from "@rollup/plugin-json"
import nodePolyfills from "rollup-plugin-node-polyfills";
import { uglify } from "rollup-plugin-uglify";
const enableMinification = process.env.minify === "on";
const base = {
  input: [],
  output: {
    dir: "dist/scripts",
    format: "iife",
    sourcemap: true,
  },
  plugins: [
    typescript(),
    commonjs(),
    json(),
    nodePolyfills(),
    nodeResolve({ preferBuiltins: false }),
  ],
};
if (enableMinification) {
  base.plugins.push(uglify());
}

export default base;
