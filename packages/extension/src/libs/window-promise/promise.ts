import {
  sendToBackgroundFromBackground,
  sendToNewWindowFromBackground,
} from '@/libs/messenger/extension';
import { ProviderName } from '@/types/provider';
import Browser from 'webextension-polyfill';
import { InternalMethods, InternalOnMessageResponse } from '@/types/messenger';
import { getCustomError, getError } from '../error';
import getUiPath from '../utils/get-ui-path';
import UIRoutes from '@/ui/provider-pages/enkrypt/routes/names';
import { ErrorCodes } from '@/providers/ethereum/types';

const UNLOCK_PATH = getUiPath(UIRoutes.unlock.path, ProviderName.enkrypt);
class WindowPromise {
  private async getRawResponse(
    url: string,
    msg: string,
    tabInfo: { tabId: number },
  ): Promise<InternalOnMessageResponse> {
    return new Promise(resolve => {
      Browser.tabs.onUpdated.addListener(function listener(_tabId, info, tab) {
        if (
          info.status === 'complete' &&
          _tabId === tabInfo.tabId &&
          tab.url === url
        ) {
          resolve(
            sendToNewWindowFromBackground(
              {
                provider: ProviderName.enkrypt,
                message: msg,
              },
              tabInfo.tabId,
            ),
          );
          Browser.tabs.onUpdated.removeListener(listener);
        }
      });
      Browser.tabs.update(tabInfo.tabId, { url });
    });
  }

  private removeTab(tabId: number) {
    Browser.tabs.get(tabId).then(info => {
      Browser.windows.remove(info.windowId!);
    });
  }

  async getResponse(
    url: string,
    msg: string,
    unlockKeyring = false,
  ): Promise<InternalOnMessageResponse> {
    const loadingURL = '/index.html#/enkrypt/loading';
    const tabInfo = {
      tabId: -1,
    };
    const windowInfo = await Browser.windows.create({
      url: loadingURL,
      type: 'popup',
      focused: true,
      height: 600,
      width: 460,
    });
    const validTabs = await Browser.tabs.query({
      windowId: windowInfo.id,
    });
    tabInfo.tabId = validTabs.length && validTabs[0].id ? validTabs[0].id : -1;
    if (typeof tabInfo.tabId === 'undefined' || tabInfo.tabId === -1) {
      return Promise.resolve({
        error: getCustomError('unknown error, no tabId'),
      });
    }
    const waitForWindow = async (): Promise<void> => {
      while ((await Browser.tabs.get(tabInfo.tabId)).status !== 'complete') {}
    };
    await waitForWindow();
    const monitorTabs = (): Promise<InternalOnMessageResponse> => {
      return new Promise(resolve => {
        const tabReplacedListener = (addedId: number, replacedId: number) => {
          if (replacedId === tabInfo.tabId) {
            tabInfo.tabId = addedId;
          }
        };
        const tabListener = (_tabId: number) => {
          if (_tabId === tabInfo.tabId) {
            Browser.tabs.onRemoved.removeListener(tabListener);
            Browser.tabs.onReplaced.removeListener(tabReplacedListener);
            resolve({
              error: getError(ErrorCodes.userRejected),
            });
          }
        };
        Browser.tabs.onRemoved.addListener(tabListener);
        Browser.tabs.onReplaced.addListener(tabReplacedListener);
      });
    };
    const executePromise = async (): Promise<InternalOnMessageResponse> => {
      const isKeyRingLocked = await sendToBackgroundFromBackground({
        provider: ProviderName.enkrypt,
        message: JSON.stringify({
          method: InternalMethods.isLocked,
          params: [],
        }),
      }).then(res => JSON.parse(res.result as string));
      if (unlockKeyring && isKeyRingLocked) {
        const unlockKeyring = await this.getRawResponse(
          Browser.runtime.getURL(UNLOCK_PATH),
          msg,
          tabInfo,
        );
        if (unlockKeyring.error) {
          this.removeTab(tabInfo.tabId);
          return unlockKeyring;
        } else {
          return await this.getRawResponse(
            Browser.runtime.getURL(url),
            msg,
            tabInfo,
          ).then(res => {
            this.removeTab(tabInfo.tabId);
            return res;
          });
        }
      }
      return await this.getRawResponse(
        Browser.runtime.getURL(url),
        msg,
        tabInfo,
      ).then(res => {
        this.removeTab(tabInfo.tabId);
        return res;
      });
    };
    return Promise.race([monitorTabs(), executePromise()]);
  }
}
export default WindowPromise;
