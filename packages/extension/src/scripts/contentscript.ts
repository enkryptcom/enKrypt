import browser from "webextension-polyfill";
import { setContentScriptNamespace } from "@/libs/messenger/extension";

setContentScriptNamespace();

function injectScript() {
  try {
    const injectURL = browser.runtime.getURL("scripts/inject.js");
    const container = document.head || document.documentElement;
    const scriptTag = document.createElement("script");
    scriptTag.setAttribute("async", "false");
    scriptTag.src = injectURL;
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
injectScript();
