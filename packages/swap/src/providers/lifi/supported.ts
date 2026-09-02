import { isEVMAddress } from "../../utils/common";
import { SupportedNetworkName } from "../../types";
import { isValidSolanaAddress } from "../../utils/solana";

/**
 * Blockchain names:
 *
 * Fetch supported EVM chains
 * ```sh
 * https://li.quest/v1/chains?chainTypes=EVM
 * ```
 *
 * Fetch Solana chain
 * ```sh
 * https://li.quest/v1/chains?chainTypes=SVM
 * ````
 *
 * Supported Networks list is prepared by taking the
 * intersection of enkrypt supported chains for swaps
 * and li.fi supported networks.
 */

const supportedNetworks: {
  readonly [key in SupportedNetworkName]?: {
    chainId: number;
    lifiName: string;
    isAddress?: (addr: string) => Promise<boolean>;
  };
} = {
  [SupportedNetworkName.Ethereum]: {
    chainId: 1,
    lifiName: "Ethereum",
    isAddress: (address: string) => Promise.resolve(isEVMAddress(address)),
  },
  [SupportedNetworkName.Arbitrum]: {
    chainId: 42161,
    lifiName: "Arbitrum",
    isAddress: (address: string) => Promise.resolve(isEVMAddress(address)),
  },
  [SupportedNetworkName.Binance]: {
    chainId: 56,
    lifiName: "BSC",
    isAddress: (address: string) => Promise.resolve(isEVMAddress(address)),
  },
  [SupportedNetworkName.Base]: {
    chainId: 8453,
    lifiName: "Base",
    isAddress: (address: string) => Promise.resolve(isEVMAddress(address)),
  },
  [SupportedNetworkName.Matic]: {
    chainId: 137,
    lifiName: "Polygon",
    isAddress: (address: string) => Promise.resolve(isEVMAddress(address)),
  },
  [SupportedNetworkName.Optimism]: {
    chainId: 10,
    lifiName: "OP Mainnet",
    isAddress: (address: string) => Promise.resolve(isEVMAddress(address)),
  },
  [SupportedNetworkName.Moonbeam]: {
    chainId: 1284,
    lifiName: "Moonbeam",
    isAddress: (address: string) => Promise.resolve(isEVMAddress(address)),
  },
  [SupportedNetworkName.Gnosis]: {
    chainId: 100,
    lifiName: "Gnosis",
    isAddress: (address: string) => Promise.resolve(isEVMAddress(address)),
  },
  [SupportedNetworkName.Avalanche]: {
    chainId: 43114,
    lifiName: "Avalanche",
    isAddress: (address: string) => Promise.resolve(isEVMAddress(address)),
  },
  [SupportedNetworkName.Kaia]: {
    chainId: 8217,
    lifiName: "Kaia",
    isAddress: (address: string) => Promise.resolve(isEVMAddress(address)),
  },
  [SupportedNetworkName.Zksync]: {
    chainId: 324,
    lifiName: "zkSync",
    isAddress: (address: string) => Promise.resolve(isEVMAddress(address)),
  },
  [SupportedNetworkName.Blast]: {
    chainId: 81457,
    lifiName: "Blast",
    isAddress: (address: string) => Promise.resolve(isEVMAddress(address)),
  },
  [SupportedNetworkName.Telos]: {
    chainId: 40,
    lifiName: "Telos",
    isAddress: (address: string) => Promise.resolve(isEVMAddress(address)),
  },
  [SupportedNetworkName.Rootstock]: {
    chainId: 30,
    lifiName: "Rootstock",
    isAddress: (address: string) =>
      Promise.resolve(isEVMAddress(address.toLowerCase())),
  },
  [SupportedNetworkName.Solana]: {
    chainId: 1151111081099710,
    lifiName: "Solana",
    async isAddress(address: string) {
      return isValidSolanaAddress(address);
    },
  },
};

export const supportedNetworksSet = new Set(
  Object.keys(supportedNetworks),
) as unknown as Set<SupportedNetworkName>;

export default supportedNetworks;
