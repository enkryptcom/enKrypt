import browser from "webextension-polyfill";
import {
  setContentScriptNamespace,
  sendToBackgroundFromCS,
} from "@/libs/messenger/extension";
import { InjectedIDs, InternalMethods } from "@/types/messenger";
import { ProviderName } from "@/types/provider";
setContentScriptNamespace();
function injectScript(settings: string) {
  settings = encodeURIComponent(settings);
  try {
    const injectURL = browser.runtime.getURL("scripts/inject.js");
    const container = document.head || document.documentElement;
    const scriptTag = document.createElement("script");
    scriptTag.setAttribute("async", "false");
    scriptTag.src = `${injectURL}?settings=${settings}`;
    scriptTag.id = InjectedIDs.main;
    scriptTag.onload = function () {
      console.info("Hello from the content-script");
      container.removeChild(scriptTag);
    };
    container.insertBefore(scriptTag, container.children[0]);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("Enkrypt: Provider injection failed.", error);
  }
}
sendToBackgroundFromCS({
  message: JSON.stringify({ method: InternalMethods.getSettings, params: [] }),
  provider: ProviderName.enkrypt,
}).then((res) => {
  if (res.result) {
    injectScript(res.result);
  }
});
