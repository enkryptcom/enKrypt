import EventEmitter from "eventemitter3";
import { handleIncomingMessage } from "./libs/message-router";
import { EthereumRequest, EthereumResponse } from "@/providers/ethereum/types";
import {
  ProviderName,
  ProviderOptions,
  ProviderType,
  ProviderInterface,
  SendMessageHandler,
} from "@/types/provider";
import { EnkryptWindow } from "@/types/globals";
import { BitcoinNetworks } from "./types";

export class Provider extends EventEmitter implements ProviderInterface {
  connected: boolean;
  name: ProviderName;
  type: ProviderType;
  version: string = __VERSION__;
  autoRefreshOnNetworkChange = false;
  networks: typeof BitcoinNetworks;
  sendMessageHandler: SendMessageHandler;
  constructor(options: ProviderOptions) {
    super();
    this.connected = true;
    this.name = options.name;
    this.type = options.type;
    this.networks = BitcoinNetworks;
    this.sendMessageHandler = options.sendMessageHandler;
  }
  async request(request: EthereumRequest): Promise<EthereumResponse> {
    const res = (await this.sendMessageHandler(
      this.name,
      JSON.stringify(request)
    )) as EthereumResponse;
    return res;
  }
  requestAccounts = async () => {
    return this.request({
      method: "btc_requestAccounts",
    });
  };

  getPublicKey = async () => {
    return this.request({
      method: "btc_getPublicKey",
    });
  };

  getNetwork = async () => {
    return Promise.resolve("livenet");
  };

  signPsbt = async (psbtHex: string, options?: any) => {
    console.log(options);
    return this.request({
      method: "btc_signPsbt",
      params: [psbtHex, options],
    });
  };

  isConnected(): boolean {
    return this.connected;
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
    console.log(prop);
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
  const proxiedProvider = new Proxy(provider, ProxyHandler);
  document["unisat"] = proxiedProvider;
  document["enkrypt"]["providers"][options.name] = provider;
};
export default injectDocument;
