import EventEmitter from "eventemitter3";
import { handleIncomingMessage } from "./libs/message-handler";
import {
  EthereumRequest,
  EthereumResponse,
  JsonRpcRequest,
  CallbackFunction,
} from "./types";
import {
  ProviderName,
  ProviderOptions,
  ProviderType,
  ProviderInterface,
  SendMessageHandler,
  EIP6963ProviderInfo,
  EIP6963Events,
} from "@/types/provider";
import { EXTENSION_VERSION } from "@/configs/constants";
import { SettingsType } from "@/libs/settings-state/types";
import { EnkryptWindow } from "@/types/globals";
import { v4 as randomUUID } from "uuid";

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
    this.version = EXTENSION_VERSION;
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
    if (
      this.selectedAddress === null &&
      request.method === "eth_requestAccounts"
    ) {
      return this.sendMessageHandler(this.name, JSON.stringify(request)).then(
        (res) => {
          this.selectedAddress = res[0];
          return res;
        }
      );
    }
    return this.sendMessageHandler(this.name, JSON.stringify(request));
  }
  enable(): Promise<any> {
    return this.request({ method: "eth_requestAccounts" });
  }
  isConnected(): boolean {
    return this.connected;
  }
  //deprecated
  send(
    method: string | JsonRpcRequest,
    params?: Array<unknown> | CallbackFunction
  ): Promise<EthereumResponse> | void {
    if ((method as JsonRpcRequest).method) {
      return this.sendAsync(
        method as JsonRpcRequest,
        params as CallbackFunction
      );
    } else {
      return this.request({
        method: method as string,
        params: params as Array<unknown>,
      });
    }
  }
  // //deprecated
  sendAsync(data: JsonRpcRequest, callback: CallbackFunction): void {
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
  const proxiedProvider = new Proxy(provider, ProxyHandler);
  if (!globalSettings.evm.inject.disabled)
    document[options.name] = proxiedProvider; //proxy is needed due to web3js 1.3.0 callbackify issue. Used in superrare
  document["enkrypt"]["providers"][options.name] = provider;
  const ENKRYPT_UUID_V4 = randomUUID();
  // EIP-6963
  const eip6963AnnounceProvider = () => {
    const info: EIP6963ProviderInfo = {
      uuid: ENKRYPT_UUID_V4,
      icon: `data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODEiIGhlaWdodD0iODEiIHZpZXdCb3g9IjAgMCA4MSA4MSIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZmlsbC1ydWxlPSJldmVub2RkIiBjbGlwLXJ1bGU9ImV2ZW5vZGQiIGQ9Ik0xNy4wMDU3IDE3LjAwNjJDMTguOTMwMyAxNS4wODE2IDIxLjU0MDUgMTQuMDAwNCAyNC4yNjIyIDE0LjAwMDRMNjcuMzI5NiAxNFYyMS44NzQxQzY3LjMyOTYgMjMuODMwNSA2Ni41NTIzIDI1LjcwNjcgNjUuMTY5IDI3LjA5QzYzLjc4NTcgMjguNDczMyA2MS45MDk1IDI5LjI1MDQgNTkuOTUzMiAyOS4yNTA0SDM5LjcwNDVDMzYuOTgyOCAyOS4yNTA0IDM0LjM3MjYgMzAuMzMxNiAzMi40NDggMzIuMjU2MUMzMC41MjM1IDM0LjE4MDcgMjkuNDQyMyAzNi43OTA5IDI5LjQ0MjMgMzkuNTEyNlY0Mi4xMjQyQzI5LjQ0MjMgNDQuODQ1OSAzMC41MjM1IDQ3LjQ1NjEgMzIuNDQ4IDQ5LjM4MDZDMzQuMzcyNiA1MS4zMDUxIDM2Ljk4MjggNTIuMzg2MyAzOS43MDQ1IDUyLjM4NjNINTkuOTUzMkM2MS45MDk1IDUyLjM4NjMgNjMuNzg1NyA1My4xNjM1IDY1LjE2OSA1NC41NDY4QzY2LjU1MjMgNTUuOTMwMSA2Ny4zMjk2IDU3LjgwNjMgNjcuMzI5NiA1OS43NjI2VjY3LjMzSDI0LjI2MjJDMjEuNTQwNSA2Ny4zMyAxOC45MzAzIDY2LjI0ODggMTcuMDA1NyA2NC4zMjQzQzE1LjA4MTIgNjIuMzk5NyAxNCA1OS43ODk1IDE0IDU3LjA2NzhWMjQuMjYyNkMxNCAyMS41NDA5IDE1LjA4MTIgMTguOTMwNyAxNy4wMDU3IDE3LjAwNjJaTTQwLjE0NzkgMzMuNTQyM0g2MC45MTU3QzY0LjQ1OCAzMy41NDIzIDY3LjMyOTUgMzYuNDEzOCA2Ny4zMjk1IDM5Ljk1NjFWNDEuNjgxNkM2Ny4zMjk1IDQ1LjIyMzggNjQuNDU4IDQ4LjA5NTQgNjAuOTE1NyA0OC4wOTU0SDQwLjE0NzlDMzYuNjA1NyA0OC4wOTU0IDMzLjczNDEgNDUuMjIzOCAzMy43MzQxIDQxLjY4MTZWMzkuOTU2MUMzMy43MzQxIDM2LjQxMzggMzYuNjA1NyAzMy41NDIzIDQwLjE0NzkgMzMuNTQyM1oiIGZpbGw9InVybCgjcGFpbnQwX2xpbmVhcl8yODdfMjM1OSkiLz4KPGRlZnM+CjxsaW5lYXJHcmFkaWVudCBpZD0icGFpbnQwX2xpbmVhcl8yODdfMjM1OSIgeDE9IjE5LjM2MDIiIHkxPSIxNCIgeDI9IjU2Ljc2OTYiIHkyPSI2OS44MDA1IiBncmFkaWVudFVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+CjxzdG9wIHN0b3AtY29sb3I9IiNDNTQ5RkYiLz4KPHN0b3Agb2Zmc2V0PSIxIiBzdG9wLWNvbG9yPSIjNjU0QkZGIi8+CjwvbGluZWFyR3JhZGllbnQ+CjwvZGVmcz4KPC9zdmc+Cg==`,
      name: "Enkrypt",
      rdns: "com.enkrypt",
    };
    document.dispatchEvent(
      new document.CustomEvent(EIP6963Events.announce, {
        detail: { info, provider: proxiedProvider },
      })
    );
  };
  document.addEventListener(EIP6963Events.request, () => {
    eip6963AnnounceProvider();
  });
  eip6963AnnounceProvider();
};
export default injectDocument;

// if anyone change anything in this file, please make sure to test it against superrare.com and app.multichain.org
