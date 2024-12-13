// import { isValidSolanaAddress } from "../../utils/solana";
import { isPolkadotAddress, isEVMAddress } from "../../utils/common";
import { SupportedNetworkName } from "../../types";
import { isValidSolanaAddress } from "../../utils/solana";

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
  readonly [key in SupportedNetworkName]?: {
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
  [SupportedNetworkName.Base]: {
    changellyName: "BASE",
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
    async isAddress(address: string) {
      return isValidSolanaAddress(address);
    },
  },
  [SupportedNetworkName.Rootstock]: {
    changellyName: "rootstock",
  },
};

export const supportedNetworksSet = new Set(
  Object.keys(supportedNetworks),
) as unknown as Set<SupportedNetworkName>;

export default supportedNetworks;
