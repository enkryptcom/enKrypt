// import KeyRing from "@enkryptcom/keyring";
// import { SignerType } from "@enkryptcom/types";
// import BrowseStorage from "@/libs/browser-storage";
import {
  backgroundOnMessageFromWindow,
  sendToWindow,
} from "@/libs/messenger/extension";
import { MessageType } from "@/types/messenger";
import { MessageMethod } from "@/providers/ethereum/types";
import { ProviderName } from "@/types/provider";
import { getError } from "@/providers/ethereum/libs/error-handler";
import Request, { RequestClass } from "@enkryptcom/request";
import { RPCRequestType, OnMessageResponse } from "@enkryptcom/types";
import EthereumProvider from "@/providers/ethereum";
import PolkadotProvider from "@/providers/polkadot";

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
// const storage = new BrowseStorage("KeyRing");
// const kr = new KeyRing(storage);
// kr.init("test pass").then(() => {
//     console.log("success")
// }).catch(console.error)
// kr.unlockMnemonic("test pass").then(() => {
//     console.log("start")
//     kr.createKey({
//         basePath: "//",
//         name: "abc",
//         type: SignerType.sr25519``
//     }).then((key) => {
//         console.log("end")
//         console.log(key)
//     })
// })
// const rpcProviders: Record<number, RequestClass> = {};

backgroundOnMessageFromWindow(
  MessageType.REQUEST,
  async (msg): Promise<OnMessageResponse> => {
    console.log(msg);
    const { method, params } = JSON.parse(msg.message);
    const _provider = msg.provider;
    const _tabid = msg.sender.tabId;
    if (!tabProviders[_provider][_tabid]) {
      const toWindow = (message: string) => {
        sendToWindow(
          MessageType.REQUEST,
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
    return tabProviders[_provider][_tabid].request({ method, params });
  }
);
