import EventEmitter from "eventemitter3";
import type { InjectedWindowProvider } from "@polkadot/extension-inject/types";
import {
  ProviderInterface,
  ProviderName,
  ProviderType,
  ProviderOptions,
  SendMessageHandler,
} from "@/types/provider";

import { SubstrateInjectedProvider } from "./types";

export class Provider
  extends EventEmitter
  implements ProviderInterface, InjectedWindowProvider
{
  name: ProviderName;
  type: ProviderType;
  sendMessageHandler: SendMessageHandler;
  version = "0.0.1";
  constructor(options: ProviderOptions) {
    super();
    this.name = options.name;
    this.type = ProviderType.substrate;
    this.sendMessageHandler = options.sendMessageHandler;
  }
  enable(dappName: string): Promise<SubstrateInjectedProvider> {}
}
