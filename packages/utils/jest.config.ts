// eslint-disable-next-line import/no-extraneous-dependencies
import { InitialOptionsTsJest } from "ts-jest/dist/types";

const config: InitialOptionsTsJest = {
  preset: "ts-jest",
  rootDir: "./",
  testEnvironment: "node",
  testPathIgnorePatterns: ["<rootDir>/dist"],
  watchPathIgnorePatterns: ["<rootDir>/dist"],
  setupFiles: ["<rootDir>/jest.setup.ts"],
  globals: {
    "ts-jest": {
      tsconfig: "<rootDir>/tsconfig.json"
    }
  }
};

export default config;
