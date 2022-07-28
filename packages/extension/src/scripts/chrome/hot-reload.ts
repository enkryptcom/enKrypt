import browser from "webextension-polyfill";
import { keccakFromString } from "ethereumjs-util";
const filesToMonitor = {
  content: {
    path: "scripts/contentscript.js",
    hash: "",
  },
  inject: {
    path: "scripts/inject.js",
    hash: "",
  },
  background: {
    path: "scripts/background.js",
    hash: "",
  },
  action: {
    path: "action.html",
    hash: "",
  },
  index: {
    path: "index.html",
    hash: "",
  },
  manifest: {
    path: "manifest.json",
    hash: "",
  },
};
const checkFilesChanged = async () => {
  let filesChanged = false;
  for (const value of Object.values(filesToMonitor)) {
    const exturl = browser.runtime.getURL(value.path);
    await fetch(exturl)
      .then((res) => res.text())
      .then((content) => {
        const hash = keccakFromString(content).toString("hex");
        if (value.hash !== hash) {
          filesChanged = true;
          value.hash = hash;
        }
      });
  }
  return filesChanged;
};
const watchChanges = async () => {
  await checkFilesChanged();
  setInterval(async () => {
    const filesChanged = await checkFilesChanged();
    if (filesChanged) {
      browser.runtime.reload();
    }
  }, 2000);
};
browser.management.getSelf().then((self) => {
  if (self.installType === "development") {
    watchChanges();
  }
});
