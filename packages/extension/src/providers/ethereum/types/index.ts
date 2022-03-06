import type { Provider as InjectedProvider } from "../inject";
import { ProviderError } from "@enkryptcom/types";
export interface ProviderMessage {
  method: MessageMethod;
  params: Array<any>;
}
export enum MessageMethod {
  changeChainId = "changeChainId",
  changeAddress = "changeAddress",
  changeConnected = "changeConnected",
  subscription = "eth_subscription",
}

export enum EmitEvent {
  accountsChanged = "accountsChanged",
  chainChanged = "chainChanged",
  connect = "connect",
  disconnect = "disconnect",
  message = "message",
}

export interface JSONError {
  error: ProviderError;
}

export interface EthereumResponse {
  result?: any;
  error?: ProviderError;
}

export enum ErrorCodes {
  userRejected = 4001,
  unauthorized = 4100,
  unsupportedMethod = 4200,
  disconnected = 4900,
  chainDisconnected = 4901,
}

export interface ProviderConnectInfo {
  readonly chainId: string;
}
export interface EthereumRequest {
  method: string;
  params?: Array<any>;
}
export interface EthereumNodeType {
  name: string;
  name_long: string;
  homePage: string;
  blockExplorerTX: string;
  blockExplorerAddr: string;
  chainID: number;
  isTestNetwork: boolean;
  currencyName: string;
  node: string;
}

export { InjectedProvider };
