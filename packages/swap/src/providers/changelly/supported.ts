import { PublicKey } from "@solana/web3.js";
import { isPolkadotAddress, isEVMAddress } from "../../utils/common";
import { SupportedNetworkName } from "../../types";

/**
 * Blockchain names:
 *
 * ```sh
 * curl -sL https://raw.githubusercontent.com/enkryptcom/dynamic-data/main/swaplists/changelly.json | jq --raw-output '.[].blockchain' | sort | uniq -c | sort -nr
 * ```
 * ```sh
 * curl https://partners.mewapi.io/changelly-v2 -X POST -H Accept:application/json -H Content-Type:application/json --data '{"id":"1","jsonrpc":"2.0","method":"getCurrenciesFull","params":{}}'
 * ````
 */
const supportedNetworks: {
  [key in SupportedNetworkName]?: {
    changellyName: string;
    isAddress?: (addr: string) => Promise<boolean>;
  };
} = {
  [SupportedNetworkName.Ethereum]: {
    changellyName: "ethereum",
    isAddress: (address: string) => Promise.resolve(isEVMAddress(address)),
  },
  [SupportedNetworkName.Binance]: {
    changellyName: "binance_smart_chain",
    isAddress: (address: string) => Promise.resolve(isEVMAddress(address)),
  },
  [SupportedNetworkName.Matic]: {
    changellyName: "polygon",
    isAddress: (address: string) => Promise.resolve(isEVMAddress(address)),
  },
  [SupportedNetworkName.EthereumClassic]: {
    changellyName: "ethereum_classic",
    isAddress: (address: string) => Promise.resolve(isEVMAddress(address)),
  },
  [SupportedNetworkName.Optimism]: {
    changellyName: "optimism",
    isAddress: (address: string) => Promise.resolve(isEVMAddress(address)),
  },
  [SupportedNetworkName.Moonbeam]: {
    changellyName: "glmr",
    isAddress: (address: string) => Promise.resolve(isEVMAddress(address)),
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
  [SupportedNetworkName.Litecoin]: {
    changellyName: "litecoin",
  },
  [SupportedNetworkName.Dogecoin]: {
    changellyName: "doge",
  },
  [SupportedNetworkName.Solana]: {
    changellyName: "solana",
    isAddress: (address: string) => {
      try {
        // eslint-disable-next-line no-new
        new PublicKey(address);
        return Promise.resolve(true);
      } catch (err) {
        return Promise.resolve(false);
      }
    },
  },
  [SupportedNetworkName.Rootstock]: {
    changellyName: "rootstock",
  },
};

export default supportedNetworks;
