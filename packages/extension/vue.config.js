const baseConfigs = require("./configs/base-build");
const chromeConfigs = require("./configs/chrome-build");
module.exports = {
  pages: {
    action: {
      template: "public/index.html",
      entry: "./src/ui/action/main.ts",
      title: "Action",
    },
    index: {
      template: "public/index.html",
      entry: "./src/ui/extension/main.ts",
      title: "enkrypt extension",
    },
  },
  indexPath: "index.html",
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
