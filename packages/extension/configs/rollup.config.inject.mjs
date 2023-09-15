import Base from "./rollup.config.base.mjs";
Base.input.push("src/scripts/inject.ts");
export default Base;
