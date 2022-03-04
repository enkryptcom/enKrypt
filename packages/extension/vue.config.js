const baseConfigs = require("./configs/base-build");
const chromeConfigs = require("./configs/chrome-build");
module.exports = {
  pages: {
    action: {
      template: "public/index.html",
      entry: "./src/ui/action/main.ts",
      title: "Action",
    },
    extension: {
      template: "public/index.html",
      entry: "./src/ui/extension/main.ts",
      title: "extension",
    },
  },
  devServer: {
    https: true,
    host: "localhost",
    hotOnly: true,
    port: 8080,
  },
  chainWebpack: (config) => {
    baseConfigs.setConfig(config);
    chromeConfigs.setConfig(config);
  },
};
