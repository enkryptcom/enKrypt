import browser, { Manifest } from "webextension-polyfill";
import { Endpoint, RuntimeContext } from "./types";

const ENDPOINT_RE =
  /^((?:background$)|devtools|popup|options|content-script|window|new-window)(?:@(\d+)(?:\.(\d+))?)?$/;

export const parseEndpoint = (endpoint: string): Endpoint => {
  const [, context, tabId, frameId] = endpoint.match(ENDPOINT_RE) || [];

  return {
    context: context as RuntimeContext,
    tabId: +tabId,
    frameId: frameId ? +frameId : undefined,
  };
};

export const isInternalEndpoint = ({ context: ctx }: Endpoint): boolean =>
  ["content-script", "background", "devtools"].includes(ctx);

// Return true if the `browser` object has a specific namespace
export const hasAPI = (nsps: string): boolean => browser[nsps];

export const getBackgroundPageType = (): RuntimeContext => {
  const manifest: Manifest.WebExtensionManifest = browser.runtime.getManifest();

  if (typeof window === "undefined") return "background";

  const popupPage =
    manifest.browser_action?.default_popup || manifest.action?.default_popup;
  if (popupPage) {
    const url = new URL(browser.runtime.getURL(popupPage));
    if (url.pathname === window.location.pathname) return "popup";
  }

  if (manifest.options_ui?.page) {
    const url = new URL(browser.runtime.getURL(manifest.options_ui.page));
    if (url.pathname === window.location.pathname) return "options";
  }
  if (
    window?.location?.pathname === "/index.html" ||
    window?.location?.pathname === "/onboard.html"
  ) {
    return "new-window";
  }
  return "background";
};
