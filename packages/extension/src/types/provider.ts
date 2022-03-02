import { InjectedProvider as EthereumProvider } from "../providers/ethereum/types";
import { OnMessageResponse } from "@enkryptcom/types";
import EventEmitter from "eventemitter3";
import { EXTENSION_VERSION } from "@/configs/constants";

export enum ProviderName {
  enkrypt = "enkrypt",
  ethereum = "ethereum",
  polkadot = "polkadot",
}
export enum ProviderType {
  evm,
  substrate,
}

export type SendMessageHandler = (
  provider: ProviderName,
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
  version: string = EXTENSION_VERSION;
  sendMessageHandler: SendMessageHandler;
  constructor(options: ProviderOptions) {
    super();
    this.name = options.name;
    this.type = options.type;
    this.sendMessageHandler = options.sendMessageHandler;
  }
  abstract handleMessage(msg: string): void;
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
