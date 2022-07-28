if (process.env.IS_DEV) {
  require("./chrome/hot-reload");
}
import "@/libs/utils/selective-wasm";
import {
  backgroundOnMessageFromWindow,
  backgroundOnMessageFromNewWindow,
  backgroundOnMessageFromAction,
  backgroundOnMessageFromBackground,
  backgroundOnMessageFromCS,
} from "@/libs/messenger/extension";
import { InternalOnMessageResponse } from "@/types/messenger";
import { OnMessageResponse } from "@enkryptcom/types";
import BackgroundHandler from "@/libs/background";
import Browser from "webextension-polyfill";
import openOnboard from "@/libs/utils/open-onboard";

const backgroundHandler = new BackgroundHandler();
backgroundHandler.init();
backgroundOnMessageFromNewWindow((msg): Promise<InternalOnMessageResponse> => {
  return backgroundHandler.internalHandler(msg);
});
backgroundOnMessageFromWindow((msg): Promise<OnMessageResponse> => {
  return backgroundHandler.externalHandler(msg);
});
backgroundOnMessageFromAction((msg): Promise<InternalOnMessageResponse> => {
  return backgroundHandler.internalHandler(msg);
});
backgroundOnMessageFromBackground((msg): Promise<InternalOnMessageResponse> => {
  return backgroundHandler.internalHandler(msg);
});
// const injectCode = fetch(Browser.runtime.getURL("scripts/inject.js")).then(
//   (res) => res.text()
// );
backgroundOnMessageFromCS((msg) => {
  function print(msg: string) {
    console.log(msg);
  }

  console.log("here");
  chrome.scripting.executeScript({
    files: ["scripts/inject.js"],
    target: { tabId: msg.sender.tabId },
    world: "MAIN",
    injectImmediately: true, // only supported chrome 102+
  });
  console.log(msg);
  return Promise.resolve({ result: "true" });
});
Browser.runtime.onInstalled.addListener((object) => {
  if (object.reason === "install") {
    openOnboard();
  }
});
