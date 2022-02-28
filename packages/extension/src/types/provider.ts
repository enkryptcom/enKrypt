import { InjectedProvider as EthereumProvider } from "../providers/ethereum/types";
import { Response } from "./messenger";
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
) => Promise<Response>;

export interface ProviderOptions {
  name: ProviderName;
  type: ProviderType;
  sendMessageHandler: SendMessageHandler;
}

export abstract class ProviderInterface {
  name: ProviderName;
  type: ProviderType;
  sendMessageHandler: SendMessageHandler;
  constructor(options: ProviderOptions) {
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
