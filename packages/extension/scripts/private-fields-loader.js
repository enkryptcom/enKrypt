module.exports = (code) =>
  require("@babel/core").transformSync(code, {
    filename: "private-fields-loader",
    plugins: [
      "@babel/plugin-proposal-private-methods",
      "@babel/plugin-proposal-class-properties",
    ],
    assumptions: {
      privateFieldsAsProperties: true,
      setPublicClassFields: true,
    },
  }).code;
