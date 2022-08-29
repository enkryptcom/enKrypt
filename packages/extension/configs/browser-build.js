const CopyWebpackPlugin = require("copy-webpack-plugin");

const package = require("../package.json");
const baseManifest = require("../src/manifest/base.json");

const BROWSER = process.env.BROWSER;
const browserNames = {
  chrome: "chrome",
  firefox: "firefox",
  opera: "opera",
};

const browserConfigs = {
  [browserNames.chrome]: {
    manifest: "./src/manifest/manifest-chrome.json",
  },
  [browserNames.firefox]: {
    manifest: "./src/manifest/manifest-firefox.json",
  },
  [browserNames.opera]: {
    manifest: "./src/manifest/manifest-opera.json",
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
  for (const [name, path] of Object.entries(scripts)) {
    config.entry(name).add(path).end();
  }
  const userScripts = Object.keys(scripts);

  //generate background and contentscript without default hashing
  config.output.filename((file) => {
    return !userScripts.includes(file.chunk.name)
      ? `js/[name].js`
      : `scripts/[name].js`;
  });
  config.output.chunkFilename("[name].js");

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
      PACKAGE_VERSION: JSON.stringify(package.version),
      IS_DEV: process.env.NODE_ENV === "development",
      IS_FIREFOX: BROWSER === browserNames.firefox,
      PREFILL_PASSWORD:
        process.env.NODE_ENV === "development"
          ? JSON.stringify("test pass")
          : JSON.stringify(""),
    };
    return args;
  });
  // prevent codesplitting on scripts
  const omitUserScripts = ({ name }) => {
    return userScripts.includes(name) ? false : "initial";
  };
  const detId = (str) => {
    let id = 0;
    for (let i = 0; i < str.length; i++) {
      id += str.charCodeAt(i);
    }
    return id % 10;
  };
  config.optimization.splitChunks({
    maxSize:
      BROWSER === browserNames.firefox ? 3 * 1024 * 1024 : 10 * 1024 * 1024,
    cacheGroups: {
      vendors: {
        name(module) {
          const packageName = module.context.match(
            /[\\/]node_modules[\\/](.*?)([\\/]|$)/
          )[1];
          return `vendor.${detId(packageName.replace("@", ""))}`;
        },
        test: /[\\/]node_modules[\\/]/,
        priority: -10,
        chunks: omitUserScripts,
        reuseExistingChunk: true,
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
