import typescript from "@rollup/plugin-typescript";
import commonjs from "@rollup/plugin-commonjs";
import nodeResolve from "@rollup/plugin-node-resolve";
import { uglify } from "rollup-plugin-uglify";
import inject from "@rollup/plugin-inject";
import replace from "@rollup/plugin-replace";
import packageJson from "../package.json" assert { type: "json" };

const enableMinification = process.env.minify === "on";
const base = {
  input: [],
  output: {
    dir: "dist/scripts",
    format: "iife",
    sourcemap: process.env.minify !== "on",
  },
  plugins: [
    replace({
      preventAssignment: true,
      __VERSION__: JSON.stringify(packageJson.version),
    }),
    typescript(),
    commonjs(),
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
