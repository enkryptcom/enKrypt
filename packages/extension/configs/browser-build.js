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
    background: "./src/scripts/chrome/background.ts",
  },
  [browserNames.firefox]: {
    manifest: "./src/manifest/manifest-firefox.json",
    background: "./src/scripts/firefox/background.ts",
  },
};

function modifyManifest(buffer) {
  const manifest = { ...baseManifest, ...JSON.parse(buffer.toString()) };
  manifest.version = package.version;
  const manifest_JSON = JSON.stringify(manifest, null, 2);
  return manifest_JSON;
}

const scripts = {
  background: browserConfigs[BROWSER].background,
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
    return userScripts.includes(name) ? false : "all";
  };
  config.optimization.set("moduleIds", "deterministic");
  config.optimization.splitChunks({
    maxSize:
      BROWSER === browserNames.firefox ? 3 * 1024 * 1024 : 10 * 1024 * 1024,
    cacheGroups: {
      vendors: {
        name: "chunk-vendors",
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
