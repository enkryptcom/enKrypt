import KeyRing from "@enkryptcom/keyring";
import BrowserStorage from "@/libs/common/browser-storage";
import {
  backgroundOnMessageFromWindow,
  backgroundOnMessageFromNewWindow,
  sendToWindow,
} from "@/libs/messenger/extension";
import { ProviderName, InternalStorageNamespace } from "@/types/provider";
import { InternalOnMessageResponse } from "@/types/messenger";
import { OnMessageResponse, SignerType } from "@enkryptcom/types";
import EthereumProvider from "@/providers/ethereum";
import PolkadotProvider from "@/providers/polkadot";
import Browser from "webextension-polyfill";
import TabInfo from "@/libs/utils/tab-info";

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
// const storage = new BrowserStorage(InternalStorageNamespace.keyring);

// const kr = new KeyRing(storage);
// kr.init("test pass")
//   .then(() => {
//     console.log("success");
//   })
//   .finally(() => {
//     kr.getMnemonic("test pass").then(console.log);
//     // kr.unlockMnemonic("test pass").then(() => {
//     //   console.log("start");
//     //   kr.createAndSaveKey({
//     //     basePath: "m/44'/60'/0'/0",
//     //     name: "abc-eth",
//     //     type: SignerType.secp256k1,
//     //   }).then((key) => {
//     //     console.log("end1");
//     //     console.log(key);
//     //   });
//     // });
//   });

// const rpcProviders: Record<number, RequestClass> = {};
backgroundOnMessageFromNewWindow(
  async (msg): Promise<InternalOnMessageResponse> => {
    console.log(msg);
    // windowPromise.getResponse("onboard.html");
    // sendToNewWindowFromBackground(
    //   {
    //     provider: ProviderName.enkrypt,
    //     message: "sending message from background",
    //   },
    //   msg.sender.tabId
    // );
    return {
      result: "hello from background",
    };
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
