const CopyWebpackPlugin = require("copy-webpack-plugin");

const scripts = {
  background: "./src/scripts/chrome/background.ts",
};

const setConfig = (config) => {
  for (let [name, path] of Object.entries(scripts)) {
    config.entry(name).add(path).end();
  }
  const userScripts = Object.keys(scripts);

  //generate background and contentscript without default hashing
  config.output.filename((file) => {
    return !userScripts.includes(file.chunk.name)
      ? `js/[name].[contenthash:8].js`
      : `scripts/[name].js`;
  });

  //copy manifest
  config.plugin("copy-manifest").use(CopyWebpackPlugin, [
    [
      {
        from: "./src/manifest/manifest-chrome.json",
        to: "manifest.json",
        //transform: ()
      },
    ],
  ]);

  // prevent codesplitting on scripts
  const omitUserScripts = ({ name }) => {
    return userScripts.includes(name) ? false : "initial";
  };
  config.optimization.splitChunks({
    cacheGroups: {
      vendors: {
        name: "chunk-vendors",
        test: /[\\/]node_modules[\\/]/,
        priority: -10,
        chunks: omitUserScripts,
      },
      common: {
        name: "chunk-common",
        minChunks: 2,
        priority: -20,
        chunks: omitUserScripts,
        reuseExistingChunk: true,
      },
    },
  });
};
exports.setConfig = setConfig;
