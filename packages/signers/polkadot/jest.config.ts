// eslint-disable-next-line import/no-extraneous-dependencies
import { InitialOptionsTsJest } from "ts-jest/dist/types";

const config: InitialOptionsTsJest = {
  preset: "ts-jest",
  rootDir: "./",
  testEnvironment: "node",
  testPathIgnorePatterns: ["<rootDir>/dist"],
  watchPathIgnorePatterns: ["<rootDir>/dist"],
  moduleFileExtensions: ["ts", "tsx", "js", "jsx", "json", "cjs"],
  globals: {
    "ts-jest": {
      tsconfig: "<rootDir>/tsconfig.json",
      babelConfig: {
        "comments": false,
        "presets": [["@babel/preset-env", {
          debug: true,
        }]]
      }
    }
  },
  transform: {
    "^.+\\.tsx?$": "ts-jest",
    "^.+\\.jsx?$": "babel-jest"
  },
};

export default config;
