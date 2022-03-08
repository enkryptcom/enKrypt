import KeyRing from "@enkryptcom/keyring";
import BrowserStorage from "@/libs/common/browser-storage";
import {
  backgroundOnMessageFromWindow,
  backgroundOnMessageFromNewWindow,
  sendToWindow,
} from "@/libs/messenger/extension";
import { ProviderName, InternalStorageNamespace } from "@/types/provider";
import { InternalOnMessageResponse } from "@/types/messenger";
import {
  OnMessageResponse,
  RPCRequestType,
  SignerType,
} from "@enkryptcom/types";
import EthereumProvider from "@/providers/ethereum";
import PolkadotProvider from "@/providers/polkadot";
import Browser from "webextension-polyfill";
import TabInfo from "@/libs/utils/tab-info";
import BackgroundHandler from "@/libs/background";
const backgroundHandler = new BackgroundHandler();
interface TabProviderType {
  [key: string]: Record<number, EthereumProvider | PolkadotProvider>;
}
interface ProviderType {
  [key: string]: typeof EthereumProvider | typeof PolkadotProvider;
}
const providers: ProviderType = {
  [ProviderName.ethereum]: EthereumProvider,
  [ProviderName.polkadot]: PolkadotProvider,
};
const tabProviders: TabProviderType = {
  [ProviderName.ethereum]: {},
  [ProviderName.polkadot]: {},
};
backgroundOnMessageFromNewWindow(
  async (msg): Promise<InternalOnMessageResponse> => {
    return backgroundHandler.internalHandler(
      JSON.parse(msg.message) as RPCRequestType
    );
  }
);
backgroundOnMessageFromWindow(async (msg): Promise<OnMessageResponse> => {
  const { method, params } = JSON.parse(msg.message);
  const _provider = msg.provider;
  const _tabid = msg.sender.tabId;
  if (!tabProviders[_provider][_tabid]) {
    const toWindow = (message: string) => {
      sendToWindow(
        {
          provider: _provider,
          message,
        },
        _tabid
      );
    };
    tabProviders[_provider][_tabid] = new providers[_provider](
      undefined,
      toWindow
    );
  }
  return tabProviders[_provider][_tabid].request({
    method,
    params,
    options: TabInfo(await Browser.tabs.get(_tabid)),
  });
});
