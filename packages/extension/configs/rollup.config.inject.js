import typescript from "@rollup/plugin-typescript";
import commonjs from "@rollup/plugin-commonjs";
import nodeResolve from "@rollup/plugin-node-resolve";

export default {
  input: ["src/scripts/inject.ts"],
  output: {
    dir: "dist/scripts",
    format: "cjs",
    sourcemap: true,
  },
  plugins: [typescript(), commonjs(), nodeResolve()],
};
