import {
  InternalMethods,
  InternalOnMessageResponse,
  Message,
} from "@/types/messenger";
import { KeyRecord, RPCRequestType } from "@enkryptcom/types";
import { getCustomError } from "../error";
import KeyRingBase from "../keyring/keyring";
import { sendToWindow } from "@/libs/messenger/extension";
import { ProviderName } from "@/types/provider";
import { OnMessageResponse } from "@enkryptcom/types";
import EthereumProvider from "@/providers/ethereum";
import PolkadotProvider from "@/providers/polkadot";
import Browser from "webextension-polyfill";
import TabInfo from "@/libs/utils/tab-info";
import { TabProviderType, ProviderType } from "./types";

class BackgroundHandler {
  #keyring: KeyRingBase;
  #tabProviders: TabProviderType;
  #providers: ProviderType;
  constructor() {
    this.#keyring = new KeyRingBase();
    this.#tabProviders = {
      [ProviderName.ethereum]: {},
      [ProviderName.polkadot]: {},
    };
    this.#providers = {
      [ProviderName.ethereum]: EthereumProvider,
      [ProviderName.polkadot]: PolkadotProvider,
    };
  }
  async externalHandler(msg: Message): Promise<OnMessageResponse> {
    const { method, params } = JSON.parse(msg.message);
    const _provider = msg.provider;
    const _tabid = msg.sender.tabId;
    if (!this.#tabProviders[_provider][_tabid]) {
      const toWindow = (message: string) => {
        sendToWindow(
          {
            provider: _provider,
            message,
          },
          _tabid
        );
      };
      this.#tabProviders[_provider][_tabid] = new this.#providers[_provider](
        undefined,
        toWindow
      );
    }
    return this.#tabProviders[_provider][_tabid].request({
      method,
      params,
      options: TabInfo(await Browser.tabs.get(_tabid)),
    });
  }
  internalHandler(msg: Message): Promise<InternalOnMessageResponse> {
    const message = JSON.parse(msg.message) as RPCRequestType;
    if (message.method === InternalMethods.sign) {
      if (!message.params || message.params.length < 2)
        return Promise.resolve({
          error: getCustomError("background: invalid params for signing"),
        });
      const msgHash = message.params[0] as `0x${string}`;
      const account = message.params[1] as KeyRecord;
      return this.#keyring
        .sign(msgHash, account)
        .then((sig) => {
          return {
            result: JSON.stringify(sig),
          };
        })
        .catch((e) => {
          return {
            error: getCustomError(e.message),
          };
        });
    } else if (message.method === InternalMethods.unlock) {
      if (!message.params || message.params.length < 1)
        return Promise.resolve({
          error: getCustomError("background: invalid params for unlocking"),
        });
      const password = message.params[0] as string;
      return this.#keyring
        .unlock(password)
        .then(() => {
          return {
            result: JSON.stringify(true),
          };
        })
        .catch((e) => {
          return {
            error: getCustomError(e.message),
          };
        });
    } else if (message.method === InternalMethods.isLocked) {
      return Promise.resolve({
        result: JSON.stringify(this.#keyring.isLocked()),
      });
    } else {
      return Promise.resolve({
        error: getCustomError(`background: unknown method: ${message.method}`),
      });
    }
  }
}

export default BackgroundHandler;
