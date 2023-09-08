import { NetworkNames } from "@enkryptcom/types";
import type { Provider as InjectedProvider } from "../inject";

export const KadenaNetworks = {
  KDA: NetworkNames.Kadena,
};

export interface KadenaApiOptions {
  networkId: string;
  chainId: string;
}

export { InjectedProvider };
