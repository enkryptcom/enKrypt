import typescript from "@rollup/plugin-typescript";
import commonjs from "@rollup/plugin-commonjs";
import nodeResolve from "@rollup/plugin-node-resolve";
import nodePolyfills from "rollup-plugin-node-polyfills";
import { uglify } from "rollup-plugin-uglify";

export default {
  input: [],
  output: {
    dir: "dist/scripts",
    format: "cjs",
    sourcemap: true,
  },
  plugins: [
    typescript(),
    commonjs(),
    nodePolyfills(),
    nodeResolve({ preferBuiltins: false }),
    uglify(),
  ],
};
