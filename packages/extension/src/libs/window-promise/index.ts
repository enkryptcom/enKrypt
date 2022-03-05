import { sendToNewWindowFromBackground } from "@/libs/messenger/extension";
import { ProviderName } from "@/types/provider";
import { OnMessageResponse } from "@enkryptcom/types";
import Browser from "webextension-polyfill";
class WindowPromise {
  async getResponse(
    url: string,
    msg: string,
    unlockKeyring = false
  ): Promise<OnMessageResponse> {
    Browser.tabs.get;
    return Browser.windows
      .create({
        url: Browser.runtime.getURL(url),
        type: "popup",
        focused: true,
      })
      .then((windowInfo) => {
        const tabId: number | undefined = windowInfo.tabs?.length
          ? windowInfo.tabs[0].id
          : 0;
        if (typeof tabId === "undefined") {
          return Promise.resolve({ error: "unknown error, no tabId" });
        }
        return sendToNewWindowFromBackground(
          {
            provider: ProviderName.enkrypt,
            message: msg,
          },
          tabId
        ).then((response) => {
          // Browser.tabs.remove(tabId);
          return response;
        });
      });
  }
}
export default WindowPromise;
