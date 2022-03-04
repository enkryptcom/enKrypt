import type { InjectedProvider as EthereumProvider } from "../providers/ethereum/types";
import type { InjectedProvider as PolkadotProvider } from "@/providers/polkadot/types";
import EventEmitter from "eventemitter3";
import { EXTENSION_VERSION } from "@/configs/constants";
import { RPCRequestType } from "@enkryptcom/types";

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
) => Promise<any>;

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
export { EthereumProvider, PolkadotProvider };
export type Provider = EthereumProvider | PolkadotProvider;

export interface ProviderRequestOptions {
  url: string;
  domain: string;
  faviconURL: string;
  title: string;
}
export interface ProviderRPCRequest extends RPCRequestType {
  options?: ProviderRequestOptions;
}
