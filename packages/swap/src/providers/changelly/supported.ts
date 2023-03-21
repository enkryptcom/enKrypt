import { isAddress } from "web3-utils";
import { isPolkadotAddress } from "../../utils/common";
import { SupportedNetworkName } from "../../types";

const supportedNetworks: {
  [key in SupportedNetworkName]?: {
    changellyName: string;
    isAddress?: (addr: string) => Promise<boolean>;
  };
} = {
  [SupportedNetworkName.Ethereum]: {
    changellyName: "ethereum",
    isAddress: (address: string) => Promise.resolve(isAddress(address)),
  },
  [SupportedNetworkName.Binance]: {
    changellyName: "binance_smart_chain",
    isAddress: (address: string) => Promise.resolve(isAddress(address)),
  },
  [SupportedNetworkName.Matic]: {
    changellyName: "polygon",
    isAddress: (address: string) => Promise.resolve(isAddress(address)),
  },
  [SupportedNetworkName.EthereumClassic]: {
    changellyName: "ethereum_classic",
    isAddress: (address: string) => Promise.resolve(isAddress(address)),
  },
  [SupportedNetworkName.Optimism]: {
    changellyName: "optimism",
    isAddress: (address: string) => Promise.resolve(isAddress(address)),
  },
  [SupportedNetworkName.Moonbeam]: {
    changellyName: "glmr",
    isAddress: (address: string) => Promise.resolve(isAddress(address)),
  },
  [SupportedNetworkName.Polkadot]: {
    changellyName: "polkadot",
    isAddress: (address: string) =>
      Promise.resolve(isPolkadotAddress(address, 0)),
  },
  [SupportedNetworkName.Kusama]: {
    changellyName: "kusama",
    isAddress: (address: string) =>
      Promise.resolve(isPolkadotAddress(address, 2)),
  },
  [SupportedNetworkName.Bitcoin]: {
    changellyName: "bitcoin",
  },
};

export default supportedNetworks;
