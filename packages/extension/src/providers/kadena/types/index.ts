import { NetworkNames } from "@enkryptcom/types";
import type { Provider as InjectedProvider } from "../inject";

export const KadenaNetworks = {
  KDA: NetworkNames.Kadena,
  KDATestnet: NetworkNames.KadenaTestnet,
};

export interface KadenaApiOptions {
  networkId: string;
  chainId: string;
}

export interface ProviderConnectInfo {
  readonly chainId: string;
}

export interface ProviderMessage {
  method: MessageMethod;
  params: Array<any>;
}

export enum MessageMethod {
  changeChainId = "changeChainId",
  changeAddress = "changeAddress",
  changeConnected = "changeConnected",
}

export enum EmitEvent {
  accountsChanged = "accountsChanged",
  chainChanged = "chainChanged",
  connect = "connect",
  disconnect = "disconnect",
  message = "message",
}

export { InjectedProvider };
