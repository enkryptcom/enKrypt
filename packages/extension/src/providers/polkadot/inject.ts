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

let sendMessageHandler: SendMessageHandler;
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
    this.sendMessageHandler = sendMessageHandler;
    sendMessageHandler = options.sendMessageHandler; //need a global var since, polkadot use enable as a function not from the class
  }
  handleMessage(msg: string): void {
    messagerRouter.handleMessage(msg);
  }
  enable(dappName: string): Promise<SubstrateInjectedProvider> {
    return Promise.resolve(
      new InjectedProvider({
        dappName,
        sendMessageHandler,
      })
    );
  }
}
const injectDocument = (
  document: EnkryptWindow | Window,
  options: ProviderOptions
): void => {
  const provider = new Provider(options);
  document.injectedWeb3 = document.injectedWeb3 || {};
  document.injectedWeb3["enkrypt"] = provider;
  document["enkrypt"]["providers"][options.name] = provider;
};

export default injectDocument;
