import Browser from "webextension-polyfill";

export const BROWSER_NAMES = {
  chrome: "chrome",
  firefox: "firefox",
  brave: "brave",
  edge: "edge",
  opera: "opera",
  safari: "safari",
};

export const detectBrowser = (): string => {
  const { userAgent } = navigator;

  if (userAgent.match(/^((?!chrome|android).)*safari/i)) {
    return BROWSER_NAMES.safari;
  }
  if (userAgent.match(/Opera|OPR/i)) {
    return BROWSER_NAMES.opera;
  }
  if (userAgent.match(/edg/i)) {
    return BROWSER_NAMES.edge;
  }
  if (userAgent.match(/chrome|chromium|crios/i)) {
    return BROWSER_NAMES.chrome;
  }
  if (userAgent.match(/firefox|fxios/i)) {
    return BROWSER_NAMES.firefox;
  }
  return "";
};

export const openLink = (url: string) => {
  if (detectBrowser() === BROWSER_NAMES.firefox) {
    Browser.windows.create({ url, focused: true });
  } else {
    window.open(url, "_blank", "noopener");
  }
};
