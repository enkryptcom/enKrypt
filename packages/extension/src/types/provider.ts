import type { InjectedProvider as EthereumProvider } from "../providers/ethereum/types";
import type { InjectedProvider as PolkadotProvider } from "@/providers/polkadot/types";
import EventEmitter from "eventemitter3";
import { EXTENSION_VERSION } from "@/configs/constants";
import {
  MiddlewareFunction,
  OnMessageResponse,
  RPCRequestType,
} from "@enkryptcom/types";
import { RouteRecordRaw } from "vue-router";
import PublicKeyRing from "@/libs/keyring/public-keyring";
import { RoutesType } from "./ui";
import { SignerType } from "@enkryptcom/types";

export enum ProviderName {
  enkrypt = "enkrypt",
  ethereum = "ethereum",
  polkadot = "polkadot",
}
export enum InternalStorageNamespace {
  keyring = "KeyRing",
  persistentEvents = "PersistentEvents",
  tabState = "TabState",
}
export enum EnkryptProviderEventMethods {
  persistentEvents = "PersistentEvents",
}
export type StorageNamespace = ProviderName | InternalStorageNamespace;
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

export abstract class BackgroundProviderInterface extends EventEmitter {
  middlewares: MiddlewareFunction[] = [];
  abstract namespace: string;
  abstract KeyRing: PublicKeyRing;
  abstract UIRoutes: RoutesType;
  abstract toWindow: (message: string) => void;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  constructor(_toWindow: (message: string) => void, options: unknown) {
    super();
  }
  abstract setRequestProvider(network: unknown): void;
  abstract request(request: ProviderRPCRequest): Promise<OnMessageResponse>;
  abstract getUIPath(page: string): string;
  abstract isPersistentEvent(request: ProviderRPCRequest): Promise<boolean>;
  abstract sendNotification(notif: string): Promise<void>;
}

export abstract class ProviderAPIInterface {
  abstract node: string;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars, @typescript-eslint/no-empty-function
  constructor(node: string, options?: unknown) {}
  abstract init(): Promise<void>;
  abstract getBalance(address: string): Promise<string>;
  abstract getBaseBalance(address: string): Promise<string>;
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

export interface UIExportOptions {
  providerName: ProviderName;
  routes: RouteRecordRaw[];
}

export interface NodeType {
  name: string;
  name_long: string;
  homePage: string;
  blockExplorerTX: string;
  blockExplorerAddr: string;
  isTestNetwork: boolean;
  currencyName: string;
  icon: any;
  signer: SignerType[];
  gradient: string;
  node: string;
  displayAddress: (address: string) => string;
  api?: () => Promise<ProviderAPIInterface>;
  provider: ProviderName;
}
