const baseConfigs = require("./configs/base-build");
const chromeConfigs = require("./configs/chrome-build");
module.exports = {
  pages: {
    index: {
      template: "public/index.html",
      entry: "./src/ui/provider-pages/main.ts",
      title: "enkrypt extension",
    },
    action: {
      template: "public/index.html",
      entry: "./src/ui/action/main.ts",
      title: "enkrypt extension popup",
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
