import {
  InternalMethods,
  InternalOnMessageResponse,
  Message,
} from "@/types/messenger";
import { RPCRequestType } from "@enkryptcom/types";
import { getCustomError } from "../error";
import KeyRingBase from "../keyring/keyring";
import { sendToWindow } from "@/libs/messenger/extension";
import { ProviderName } from "@/types/provider";
import { OnMessageResponse } from "@enkryptcom/types";
import Providers from "@/providers";
import Browser from "webextension-polyfill";
import TabInfo from "@/libs/utils/tab-info";
import PersistentEvents from "@/libs/persistent-events";
import DomainState from "@/libs/domain-state";
import { TabProviderType, ProviderType, ExternalMessageOptions } from "./types";
import { getProviderNetworkByName } from "../utils/networks";
import {
  sign,
  getEthereumPubKey,
  ethereumDecrypt,
  unlock,
  changeNetwork,
  sendToTab,
  newAccount,
  lock,
} from "./internal";
import { handlePersistentEvents } from "./external";
import SettingsState from "../settings-state";

class BackgroundHandler {
  #keyring: KeyRingBase;
  #tabProviders: TabProviderType;
  #providers: ProviderType;
  #persistentEvents: PersistentEvents;
  #domainState: DomainState;

  constructor() {
    this.#keyring = new KeyRingBase();
    this.#persistentEvents = new PersistentEvents();
    this.#domainState = new DomainState();
    this.#tabProviders = {
      [ProviderName.ethereum]: {},
      [ProviderName.polkadot]: {},
      [ProviderName.bitcoin]: {},
    };
    this.#providers = Providers;
  }
  async init(): Promise<void> {
    await handlePersistentEvents.bind(this)();
  }
  async externalHandler(
    msg: Message,
    options: ExternalMessageOptions = { savePersistentEvents: true }
  ): Promise<OnMessageResponse> {
    const { method, params } = JSON.parse(msg.message);
    const _provider = msg.provider;
    const _tabid = msg.sender.tabId;
    if (_provider === ProviderName.enkrypt) {
      if (
        method === InternalMethods.newWindowInit ||
        method === InternalMethods.newWindowUnload
      ) {
        this.#persistentEvents.deleteEvents(_tabid);
        return {
          result: JSON.stringify(true),
        };
      } else if (method === InternalMethods.getSettings) {
        const settingsState = new SettingsState();
        return settingsState.getAllSettings().then((settings) => {
          return {
            result: JSON.stringify(settings),
          };
        });
      }
      return {
        error: JSON.stringify(getCustomError("Enkrypt: not implemented")),
      };
    }
    const tabInfo = TabInfo(await Browser.tabs.get(_tabid));
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
        toWindow
      );
      const domainState = await this.#domainState.getStateByDomain(
        tabInfo.domain
      );
      if (domainState.selectedNetwork) {
        const providerNetwork = await getProviderNetworkByName(
          _provider,
          domainState.selectedNetwork
        );

        if (providerNetwork) {
          this.#tabProviders[_provider][_tabid].setRequestProvider(
            providerNetwork
          );
        }
      }
    }
    const isPersistent = await this.#tabProviders[_provider][
      _tabid
    ].isPersistentEvent({ method, params });
    return this.#tabProviders[_provider][_tabid]
      .request({
        method,
        params,
        options: tabInfo,
      })
      .then((response) => {
        if (isPersistent && !response.error && options.savePersistentEvents)
          return this.#persistentEvents
            .addEvent(_tabid, msg, response)
            .then(() => response);
        return response;
      });
  }
  internalHandler(msg: Message): Promise<InternalOnMessageResponse> {
    const message = JSON.parse(msg.message) as RPCRequestType;
    switch (message.method) {
      case InternalMethods.sign:
        return sign(this.#keyring, message);
      case InternalMethods.getEthereumEncryptionPublicKey:
        return getEthereumPubKey(this.#keyring, message);
      case InternalMethods.ethereumDecrypt:
        return ethereumDecrypt(this.#keyring, message);
      case InternalMethods.unlock:
        return unlock(this.#keyring, message);
      case InternalMethods.lock:
        return lock(this.#keyring);
      case InternalMethods.changeNetwork:
        return changeNetwork(msg, this.#tabProviders);
      case InternalMethods.isLocked:
        return Promise.resolve({
          result: JSON.stringify(this.#keyring.isLocked()),
        });
      case InternalMethods.sendToTab:
        return sendToTab(msg, this.#tabProviders);
      case InternalMethods.getNewAccount:
      case InternalMethods.saveNewAccount:
        return newAccount(this.#keyring, message);
      default:
        return Promise.resolve({
          error: getCustomError(
            `background: unknown method: ${message.method}`
          ),
        });
    }
  }
}

export default BackgroundHandler;
