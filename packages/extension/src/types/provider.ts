import { InjectedProvider as EthereumProvider } from "../providers/ethereum/types";
import { OnMessageResponse } from "@enkryptcom/types";
import EventEmitter from "eventemitter3";
export enum ProviderName {
  enkrypt = "enkrypt",
  ethereum = "ethereum",
}
export enum ProviderType {
  evm,
  substrate,
}

export type SendMessageHandler = (
  provider: Provider,
  message: string
) => Promise<OnMessageResponse>;

export interface ProviderOptions {
  name: ProviderName;
  type: ProviderType;
  sendMessageHandler: SendMessageHandler;
}

export abstract class ProviderInterface extends EventEmitter {
  name: ProviderName;
  type: ProviderType;
  sendMessageHandler: SendMessageHandler;
  constructor(options: ProviderOptions) {
    super();
    this.name = options.name;
    this.type = options.type;
    this.sendMessageHandler = options.sendMessageHandler;
  }
}

export type handleIncomingMessage = (
  provider: Provider,
  message: string
) => void;

export type handleOutgoingMessage = (
  provider: Provider,
  message: string
) => Promise<any>;

export type Provider = EthereumProvider;
