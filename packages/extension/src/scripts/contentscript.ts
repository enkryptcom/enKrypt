import Browser from "webextension-polyfill";
import { setContentScriptNamespace } from "@/libs/messenger/extension";
import { InjectedIDs } from "@/types/messenger";
setContentScriptNamespace();
function injectScript() {
  try {
    const injectURL = Browser.runtime.getURL("scripts/inject.js");
    const container = document.head || document.documentElement;
    const scriptTag = document.createElement("script");
    scriptTag.setAttribute("async", "false");
    scriptTag.src = injectURL;
    scriptTag.id = InjectedIDs.main;
    scriptTag.onload = function () {
      console.info("Enkrypt: Hello from CS");
      container.removeChild(scriptTag);
    };
    container.insertBefore(scriptTag, container.children[0]);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("Enkrypt: Provider injection failed.", error);
  }
}

if (Browser.runtime.getManifest().manifest_version === 2) {
  injectScript();
}
