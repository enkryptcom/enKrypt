import {
  sendToBackgroundFromBackground,
  sendToNewWindowFromBackground,
} from "@/libs/messenger/extension";
import { ProviderName } from "@/types/provider";
import Browser from "webextension-polyfill";
import { InternalMethods, InternalOnMessageResponse } from "@/types/messenger";
import { getCustomError, getError } from "../error";
import getUiPath from "../utils/get-ui-path";
import UIRoutes from "@/ui/provider-pages/enkrypt/routes/names";
import { ErrorCodes } from "@/providers/ethereum/types";

const UNLOCK_PATH = getUiPath(UIRoutes.unlock.path, ProviderName.enkrypt);
class WindowPromise {
  private async getRawResponse(
    url: string,
    msg: string,
    tabId: number
  ): Promise<InternalOnMessageResponse> {
    return new Promise((resolve) => {
      Browser.tabs.onUpdated.addListener(function listener(_tabId, info, tab) {
        if (info.status === "complete" && _tabId === tabId && tab.url === url) {
          resolve(
            sendToNewWindowFromBackground(
              {
                provider: ProviderName.enkrypt,
                message: msg,
              },
              tabId
            )
          );
          Browser.tabs.onUpdated.removeListener(listener);
        }
      });
      Browser.tabs.update(tabId, { url });
    });
  }

  private removeTab(tabId: number) {
    Browser.tabs.get(tabId).then((info) => {
      Browser.windows.remove(info.windowId!);
    });
  }

  async getResponse(
    url: string,
    msg: string,
    unlockKeyring = false
  ): Promise<InternalOnMessageResponse> {
    const windowInfo = await Browser.windows.create({
      url: "/index.html#/enkrypt/loading",
      type: "popup",
      focused: true,
      height: 600,
      width: 460,
    });
    const tabId: number | undefined = windowInfo.tabs?.length
      ? windowInfo.tabs[0].id
      : 0;
    if (typeof tabId === "undefined") {
      return Promise.resolve({
        error: getCustomError("unknown error, no tabId"),
      });
    }
    const waitForWindow = async (): Promise<void> => {
      // eslint-disable-next-line no-empty
      while ((await Browser.tabs.get(tabId)).status !== "complete") {}
    };
    await waitForWindow();
    const monitorTabs = (): Promise<InternalOnMessageResponse> => {
      return new Promise((resolve) => {
        Browser.tabs.onRemoved.addListener(function tabListener(_tabId) {
          if (_tabId === tabId) {
            Browser.tabs.onRemoved.removeListener(tabListener);
            resolve({
              error: getError(ErrorCodes.userRejected),
            });
          }
        });
      });
    };
    const executePromise = async (): Promise<InternalOnMessageResponse> => {
      const isKeyRingLocked = await sendToBackgroundFromBackground({
        provider: ProviderName.enkrypt,
        message: JSON.stringify({
          method: InternalMethods.isLocked,
          params: [],
        }),
      }).then((res) => JSON.parse(res.result as string));
      if (unlockKeyring && isKeyRingLocked) {
        const unlockKeyring = await this.getRawResponse(
          Browser.runtime.getURL(UNLOCK_PATH),
          msg,
          tabId
        );
        if (unlockKeyring.error) {
          this.removeTab(tabId);
          return unlockKeyring;
        } else {
          return await this.getRawResponse(
            Browser.runtime.getURL(url),
            msg,
            tabId
          ).then((res) => {
            this.removeTab(tabId);
            return res;
          });
        }
      }
      return await this.getRawResponse(
        Browser.runtime.getURL(url),
        msg,
        tabId
      ).then((res) => {
        this.removeTab(tabId);
        return res;
      });
    };
    return Promise.race([monitorTabs(), executePromise()]);
  }
}
export default WindowPromise;
