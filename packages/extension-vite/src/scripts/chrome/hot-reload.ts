import browser from "webextension-polyfill";
const filesToMonitor = {
  content: {
    path: "scripts/contentscript.js",
    length: 0,
  },
  inject: {
    path: "scripts/inject.js",
    length: 0,
  },
  background: {
    path: "scripts/background.js",
    length: 0,
  },
  action: {
    path: "action.html",
    length: 0,
  },
  index: {
    path: "index.html",
    length: 0,
  },
  manifest: {
    path: "manifest.json",
    length: 0,
  },
};
const checkFilesChanged = async () => {
  let filesChanged = false;
  for (const value of Object.values(filesToMonitor)) {
    const exturl = browser.runtime.getURL(value.path);
    await fetch(exturl)
      .then((res) => res.text())
      .then((content) => {
        const length = content.length;
        if (value.length !== length) {
          filesChanged = true;
          value.length = length;
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
