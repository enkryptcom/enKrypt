import { isAddress } from "web3-utils";
import { NetworkNames } from "@enkryptcom/types";
import { isPolkadotAddress } from "../../utils/common";

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
    isAddress: (address: string) =>
      Promise.resolve(isPolkadotAddress(address, 0)),
  },
  [NetworkNames.Kusama]: {
    changellyName: "kusama",
    isAddress: (address: string) =>
      Promise.resolve(isPolkadotAddress(address, 2)),
  },
  [NetworkNames.Bitcoin]: {
    changellyName: "bitcoin",
  },
};

export default supportedNetworks;
