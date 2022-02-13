const path = require("path");

module.exports = {
  extends: [
    "plugin:vue/vue3-recommended",
    "plugin:import/errors",
    "plugin:import/warnings",
    "plugin:import/typescript",
    "plugin:@typescript-eslint/recommended",
    "prettier",
  ],
  plugins: ["@typescript-eslint"],
  root: true,
  globals: {},
  rules: {
    "@typescript-eslint/no-var-requires": "off",
    "no-multi-assign": "off",
    "no-param-reassign": "off",
    "no-underscore-dangle": "off",
    "no-continue": "off",
    "@typescript-eslint/ban-ts-comment": "off",
    "no-console": "off",
    "no-plusplus": "off",
    "no-nested-ternary": "off",
    "no-restricted-globals": "off",
    "no-use-before-define": "off",
    "import/no-extraneous-dependencies": "off",
    "vue/multi-word-component-names": "off",
    "import/extensions": [
      "error",
      "ignorePackages",
      {
        js: "never",
        jsx: "never",
        ts: "never",
        tsx: "never",
      },
    ],
    "import/no-unresolved": [
      2,
      {
        commonjs: true,
        amd: true,
      },
    ],
    "import/prefer-default-export": "off",
    "max-len": [
      "error",
      {
        code: 150,
        ignoreComments: true,
        ignoreTrailingComments: true,
        ignoreUrls: true,
        ignoreStrings: true,
        ignoreTemplateLiterals: true,
      },
    ],
  },
  env: {},
  parser: "@typescript-eslint/parser",
  overrides: [
    {
      files: ["*.vue"],
      parser: "vue-eslint-parser",
    },
  ],
  settings: {
    "import/resolver": {
      alias: {
        map: [["@src", path.resolve(__dirname, "./src")]],
        extensions: [".ts", ".js", ".d.ts"],
      },
    },
  },
};
