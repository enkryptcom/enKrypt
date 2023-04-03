import { NetworkNames } from "@enkryptcom/types";

export interface TokenBalance {
  contract: string;
  balance: string;
}
export interface SupportedNetwork {
  tbName: string;
  cgPlatform?: string;
}
export interface CGToken {
  chainId: `0x${string}`;
  address: string;
  name: string;
  symbol: string;
  decimals: number;
  logoURI: string;
}

export interface ZkSyncBalanceType {
  balance: string;
  contractAddress: string;
  decimals: string;
  name: string;
  symbol: string;
}

export type SupportedNetworkNames =
  | NetworkNames.Binance
  | NetworkNames.Ethereum
  | NetworkNames.Matic
  | NetworkNames.AstarEVM
  | NetworkNames.Okc
  | NetworkNames.Optimism
  | NetworkNames.Moonriver
  | NetworkNames.Moonbeam
  | NetworkNames.ShidenEVM
  | NetworkNames.Canto
  | NetworkNames.Rootstock
  | NetworkNames.Arbitrum
  | NetworkNames.Gnosis
  | NetworkNames.Avalanche
  | NetworkNames.Fantom
  | NetworkNames.Klaytn
  | NetworkNames.Aurora
  | NetworkNames.ZkSyncGoerli
  | NetworkNames.ZkSync
  | NetworkNames.TomoChain;
