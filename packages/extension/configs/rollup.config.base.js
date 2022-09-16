import typescript from "@rollup/plugin-typescript";
import commonjs from "@rollup/plugin-commonjs";
import nodeResolve from "@rollup/plugin-node-resolve";
import { uglify } from "rollup-plugin-uglify";
import inject from "@rollup/plugin-inject";
import json from "@rollup/plugin-json";

const enableMinification = process.env.minify === "on";
const base = {
  input: [],
  output: {
    dir: "dist/scripts",
    format: "iife",
    sourcemap: process.env.minify !== "on",
  },
  plugins: [
    typescript(),
    commonjs(),
    json(),
    inject({
      Buffer: ["buffer", "Buffer"],
    }),
    nodeResolve({ preferBuiltins: false }),
  ],
};
if (enableMinification) {
  base.plugins.push(uglify());
}

export default base;
