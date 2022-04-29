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
const injectDocument = (
  document: EnkryptWindow | Window,
  options: ProviderOptions
): void => {
  const provider = new Provider(options);
  document.injectedWeb3 = document.injectedWeb3 || {};
  document.injectedWeb3["enkrypt"] = provider;
  document.injectedWeb3["polkadot-js"] = provider;
  document["enkrypt"]["providers"][options.name] = provider;
};

export default injectDocument;
