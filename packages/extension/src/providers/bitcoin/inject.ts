import EventEmitter from "eventemitter3";
import type { InjectedWindowProvider } from "@polkadot/extension-inject/types";
import {
  ProviderInterface,
  ProviderName,
  ProviderType,
  ProviderOptions,
  SendMessageHandler,
} from "@/types/provider";
import InjectedProvider from "./libs/injected-provider";
import { SubstrateInjectedProvider } from "./types";
import MessageRouter from "./libs/message-router";
import { EXTENSION_VERSION } from "@/configs/constants";
import { InjectedSendMessageHandler } from "./types";
import { OnMessageResponse, RPCRequestType } from "@enkryptcom/types";
import { SettingsType } from "@/libs/settings-state/types";
import { EnkryptWindow } from "@/types/globals";
let sendMessageHandler: InjectedSendMessageHandler;
const messagerRouter = new MessageRouter();
export class Provider
  extends EventEmitter
  implements ProviderInterface, InjectedWindowProvider
{
  name: ProviderName;
  type: ProviderType;
  version = EXTENSION_VERSION;
  sendMessageHandler: SendMessageHandler;
  constructor(options: ProviderOptions) {
    super();
    this.name = options.name;
    this.type = options.type;
    this.sendMessageHandler = options.sendMessageHandler;
    sendMessageHandler = (
      id: number,
      message: RPCRequestType
    ): Promise<OnMessageResponse> => {
      const { method, params } = message;
      return options.sendMessageHandler(
        options.name,
        JSON.stringify({ id, method, params })
      );
    }; //need a global var since, polkadot use enable as a function not from the class
  }
  handleMessage(msg: string): void {
    messagerRouter.handleMessage(msg);
  }
  enable(dappName: string): Promise<SubstrateInjectedProvider> {
    const id = messagerRouter.nextPosition();
    const newProvider = new InjectedProvider({
      dappName,
      sendMessageHandler,
      id,
    });
    messagerRouter.addProvider(newProvider);
    return Promise.resolve(newProvider);
  }
}

const ProxyHandler = {
  proxymethods: ["enable"],
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
      writable: false,
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
  document.injectedWeb3 = document.injectedWeb3 || {};
  document.injectedWeb3["enkrypt"] = new Proxy(provider, ProxyHandler);
  const globalSettings: SettingsType = document.enkrypt.settings;
  if (globalSettings.substrate.injectPolkadotjs)
    document.injectedWeb3["polkadot-js"] = new Proxy(provider, ProxyHandler);
  document["enkrypt"]["providers"][options.name] = provider;
};

export default injectDocument;
