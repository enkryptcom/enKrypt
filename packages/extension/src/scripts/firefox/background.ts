if (process.env.IS_DEV) {
  require("../chrome/hot-reload");
}
import {
  backgroundOnMessageFromWindow,
  backgroundOnMessageFromNewWindow,
  backgroundOnMessageFromAction,
  backgroundOnMessageFromBackground,
  backgroundOnMessageFromCS,
} from "@/libs/messenger/extension";
import { InternalOnMessageResponse } from "@/types/messenger";
import { OnMessageResponse } from "@enkryptcom/types";
import Browser from "webextension-polyfill";
import openOnboard from "@/libs/utils/open-onboard";

import(/* webpackChunkName: "background-chunk" */ "@/libs/background").then(
  ({ default: BackgroundHandler }) => {
    const backgroundHandler = new BackgroundHandler();
    backgroundHandler.init();
    backgroundOnMessageFromNewWindow(
      (msg): Promise<InternalOnMessageResponse> => {
        return backgroundHandler.internalHandler(msg);
      }
    );
    backgroundOnMessageFromWindow((msg): Promise<OnMessageResponse> => {
      return backgroundHandler.externalHandler(msg);
    });
    backgroundOnMessageFromAction((msg): Promise<InternalOnMessageResponse> => {
      return backgroundHandler.internalHandler(msg);
    });
    backgroundOnMessageFromBackground(
      (msg): Promise<InternalOnMessageResponse> => {
        return backgroundHandler.internalHandler(msg);
      }
    );
    backgroundOnMessageFromCS((msg): Promise<OnMessageResponse> => {
      return backgroundHandler.externalHandler(msg);
    });
  }
);

Browser.runtime.onInstalled.addListener((object) => {
  if (object.reason === "install") {
    openOnboard();
  }
});
