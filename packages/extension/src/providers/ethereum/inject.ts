import EventEmitter from "eventemitter3";
import { handleIncomingMessage } from "./libs/message-handler";
import {
  EthereumRequest,
  EthereumResponse,
  JsonRpcRequest,
  JsonRpcResponse,
} from "./types";
import {
  ProviderName,
  ProviderOptions,
  ProviderType,
  ProviderInterface,
  SendMessageHandler,
} from "@/types/provider";
import { EXTENSION_VERSION } from "@/configs/constants";
import { SettingsType } from "@/libs/settings-state/types";
import { EnkryptWindow } from "@/types/globals";

export class Provider extends EventEmitter implements ProviderInterface {
  chainId: string | null;
  networkVersion: string;
  isEnkrypt: boolean;
  isMetaMask: boolean;
  selectedAddress: string | null;
  connected: boolean;
  name: ProviderName;
  type: ProviderType;
  version: string = EXTENSION_VERSION;
  autoRefreshOnNetworkChange = false;
  sendMessageHandler: SendMessageHandler;
  constructor(options: ProviderOptions) {
    super();
    this.chainId = null; //deprecated
    this.networkVersion = "0x1"; //deprecated
    this.isEnkrypt = true;
    this.isMetaMask = true;
    this.selectedAddress = null; //deprecated
    this.connected = true;
    this.name = options.name;
    this.type = options.type;
    this.sendMessageHandler = options.sendMessageHandler;
  }
  async request(request: EthereumRequest): Promise<EthereumResponse> {
    if (this.chainId === null) {
      await this.sendMessageHandler(
        this.name,
        JSON.stringify({
          method: "eth_chainId",
        })
      ).then((res) => {
        this.chainId = res;
        this.networkVersion = res;
      });
    }
    if (this.selectedAddress === null) {
      await this.sendMessageHandler(
        this.name,
        JSON.stringify({
          method: "eth_accounts",
        })
      ).then((res) => {
        this.selectedAddress = res[0];
      });
    }
    const res = (await this.sendMessageHandler(
      this.name,
      JSON.stringify(request)
    )) as EthereumResponse;
    return res;
  }
  enable(): Promise<any> {
    return this.request({ method: "eth_requestAccounts" });
  }
  isConnected(): boolean {
    return this.connected;
  }
  //deprecated
  send(method: string, params?: Array<unknown>): Promise<EthereumResponse> {
    return this.request({ method, params });
  }
  // //deprecated
  sendAsync(
    data: JsonRpcRequest,
    callback: (err: Error | null, res?: JsonRpcResponse) => void
  ): void {
    const { method, params } = data as EthereumRequest;
    this.request({ method, params })
      .then((res) => {
        callback(null, {
          id: data.id,
          jsonrpc: "2.0",
          result: res,
        });
      })
      .catch((err) => callback(err));
  }
  handleMessage(msg: string): void {
    handleIncomingMessage(this, msg);
  }
}

const ProxyHandler = {
  proxymethods: ["request", "sendAsync", "send"],
  writableVars: ["autoRefreshOnNetworkChange"],
  ownKeys(target: Provider) {
    return Object.keys(target).concat(this.proxymethods);
  },
  set(target: Provider, name: keyof Provider, value: any) {
    if (!this.ownKeys(target).includes(name)) this.proxymethods.push(name);
    return Reflect.set(target, name, value);
  },
  getOwnPropertyDescriptor(target: Provider, name: keyof Provider) {
    return {
      value: this.get(target, name),
      configurable: true,
      writable: this.writableVars.includes(name),
      enumerable: true,
    };
  },
  get(target: Provider, prop: keyof Provider) {
    if (typeof target[prop] === "function") {
      return (target[prop] as () => any).bind(target);
    }
    return target[prop];
  },
  has(target: Provider, name: keyof Provider) {
    return this.ownKeys(target).includes(name);
  },
};
const injectDocument = (
  document: EnkryptWindow | Window,
  options: ProviderOptions
): void => {
  const provider = new Provider(options);
  const globalSettings: SettingsType = document.enkrypt.settings;
  if (!globalSettings.evm.inject.disabled)
    document[options.name] = new Proxy(provider, ProxyHandler); //proxy is needed due to web3js 1.3.0 callbackify issue. Used in superrare
  document["enkrypt"]["providers"][options.name] = provider;
};
export default injectDocument;

// if anyone change anything in this file, please make sure to test it against superrare.com and app.multichain.org
