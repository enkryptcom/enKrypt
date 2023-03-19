import { NetworkNames } from "@enkryptcom/types";
import { isAddress } from "web3-utils";

const supportedNetworks: {
  [key in NetworkNames]?: {
    changellyName: string;
    isAddress?: (addr: string) => Promise<boolean>;
  };
} = {
  [NetworkNames.Ethereum]: {
    changellyName: "ethereum",
    isAddress: (address: string) => Promise.resolve(isAddress(address)),
  },
  [NetworkNames.Binance]: {
    changellyName: "binance_smart_chain",
    isAddress: (address: string) => Promise.resolve(isAddress(address)),
  },
  [NetworkNames.Matic]: {
    changellyName: "polygon",
    isAddress: (address: string) => Promise.resolve(isAddress(address)),
  },
  [NetworkNames.EthereumClassic]: {
    changellyName: "ethereum_classic",
    isAddress: (address: string) => Promise.resolve(isAddress(address)),
  },
  [NetworkNames.Optimism]: {
    changellyName: "optimism",
    isAddress: (address: string) => Promise.resolve(isAddress(address)),
  },
  [NetworkNames.Moonbeam]: {
    changellyName: "glmr",
    isAddress: (address: string) => Promise.resolve(isAddress(address)),
  },
  [NetworkNames.Polkadot]: {
    changellyName: "polkadot",
  },
  [NetworkNames.Kusama]: {
    changellyName: "kusama",
  },
  [NetworkNames.Bitcoin]: {
    changellyName: "bitcoin",
  },
};

export default supportedNetworks;
