import browser from "webextension-polyfill";
import { setContentScriptNamespace } from "@/libs/messenger/extension";

setContentScriptNamespace();

const injectURL = browser.runtime.getURL("scripts/inject.js");
fetch(injectURL).then((response) => {
  response.text().then((inpageContent) => {
    const inpageSuffix = `//# sourceURL=${injectURL}\n`;
    const inpageBundle = inpageContent + inpageSuffix;
    injectScript(inpageBundle);
  });
});
function injectScript(content: string) {
  try {
    const container = document.head || document.documentElement;
    const scriptTag = document.createElement("script");
    scriptTag.setAttribute("async", "false");
    scriptTag.textContent = content;
    container.insertBefore(scriptTag, container.children[0]);
    container.removeChild(scriptTag);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("Enkrypt: Provider injection failed.", error);
  }
}
console.log("Hello from the content-script");
