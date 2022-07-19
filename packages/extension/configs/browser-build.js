const CopyWebpackPlugin = require("copy-webpack-plugin");

const package = require("../package.json");
const baseManifest = require("../src/manifest/base.json");

const BROWSER = process.env.BROWSER;
const browserNames = {
  chrome: "chrome",
  firefox: "firefox",
};
const browserConfigs = {
  [browserNames.chrome]: {
    manifest: "./src/manifest/manifest-chrome.json",
  },
  [browserNames.firefox]: {
    manifest: "./src/manifest/manifest-firefox.json",
  },
};
function modifyManifest(buffer) {
  const manifest = { ...baseManifest, ...JSON.parse(buffer.toString()) };
  manifest.version = package.version;
  const manifest_JSON = JSON.stringify(manifest, null, 2);
  return manifest_JSON;
}

const scripts = {
  background: "./src/scripts/background.ts",
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
  const copyManifest = new CopyWebpackPlugin({
    patterns: [
      {
        from: browserConfigs[BROWSER].manifest,
        to: "manifest.json",
        transform: modifyManifest,
      },
    ],
  });
  config.plugin("copy-manifest").use(copyManifest);
  config.plugin("define").tap((args) => {
    const _base = args[0]["process.env"];
    args[0]["process.env"] = {
      ..._base,
      IS_MANIFEST_V3: BROWSER === browserNames.chrome,
    };
    return args;
  });
  // prevent codesplitting on scripts
  const omitUserScripts = ({ name }) => {
    return userScripts.includes(name) ? false : "initial";
  };
  config.optimization.splitChunks({
    maxSize: 4194304,
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
