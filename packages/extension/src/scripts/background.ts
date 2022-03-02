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

interface TabProviderType {
  [key: string]: Record<number, EthereumProvider>;
}
interface ProviderType {
  [key: string]: typeof EthereumProvider;
}
const providers: ProviderType = {
  [ProviderName.ethereum]: EthereumProvider,
};
const tabProviders: TabProviderType = {
  [ProviderName.ethereum]: {},
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
    const { method, params } = JSON.parse(msg.message);
    const _provider = msg.provider;
    const _tabid = msg.sender.tabId;
    if (!tabProviders[_provider][_tabid]) {
      tabProviders[_provider][_tabid] = new providers[_provider]();
    }
    return tabProviders[_provider][_tabid].request({ method, params });
    // if (method === "eth_requestAccounts" || method === "eth_accounts") {
    //   return {
    //     result: JSON.stringify(["0xe5DC07BdCDB8C98850050C7f67De7E164b1eA391"]),
    //   };
    // } else {
    //   let request = null;
    //   if (rpcProviders[msg.sender.tabId]) {
    //     request = rpcProviders[msg.sender.tabId];
    //   } else {
    //     const tabId = msg.sender.tabId;
    //     rpcProviders[tabId] = Request("wss://nodes.mewapi.io/ws/eth", []);
    //     rpcProviders[tabId].on("notification", (notif: RPCRequestType) => {
    //       const { method, params } = notif;
    //       sendToWindow(
    //         MessageType.REQUEST,
    //         {
    //           provider: ProviderName.ethereum,
    //           message: JSON.stringify({ method, params }),
    //         },
    //         tabId
    //       );
    //     });
    //     request = rpcProviders[msg.sender.tabId];
    //   }
    //   return request
    //     .request({ method, params })
    //     .then((res: any) => {
    //       return {
    //         result: JSON.stringify(res),
    //       };
    //     })
    //     .catch((err: Error) => {
    //       console.log(method, params, err.message);
    //       return {
    //         error: JSON.stringify(err.message),
    //       };
    //     });
    // }
  }
);
