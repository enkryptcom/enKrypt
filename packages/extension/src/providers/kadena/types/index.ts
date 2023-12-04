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

export interface ProviderMessage {
  method: MessageMethod;
  params: Array<any>;
}

export enum MessageMethod {
  changeAddress = "changeAddress",
  changeNetwork = "changeNetwork",
}

export enum EmitEvent {
  accountsChanged = "accountsChanged",
  networkChanged = "networkChanged",
}

export const chainIds: string[] = [
  "0",
  "1",
  "2",
  "3",
  "4",
  "5",
  "6",
  "7",
  "8",
  "9",
  "10",
  "11",
  "12",
  "13",
  "14",
  "15",
  "16",
  "17",
  "18",
  "19",
];
export const defaultChainId = "0";

export { InjectedProvider };
