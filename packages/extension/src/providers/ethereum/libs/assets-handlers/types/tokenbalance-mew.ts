import { NetworkNames } from '@enkryptcom/types';

export interface TokenBalance {
  contract: string;
  balance: string;
}
export interface SupportedNetwork {
  tbName?: string;
  cgPlatform?: string;
  bsEndpoint?: boolean;
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
  | NetworkNames.ArbitrumNova
  | NetworkNames.Gnosis
  | NetworkNames.Avalanche
  | NetworkNames.Fantom
  | NetworkNames.Kaia
  | NetworkNames.Aurora
  | NetworkNames.TomoChain
  | NetworkNames.Shibarium
  | NetworkNames.MaticZK
  | NetworkNames.Celo
  | NetworkNames.ZkSync
  | NetworkNames.Telos
  | NetworkNames.SyscoinNEVM
  | NetworkNames.Rollux
  | NetworkNames.Sanko
  | NetworkNames.Degen
  | NetworkNames.Blast
  | NetworkNames.Solana
  | NetworkNames.XLayer
  | NetworkNames.ProofOfPlayApex
  | NetworkNames.Godwoken
  | NetworkNames.Linea
  | NetworkNames.MantaPacific
  | NetworkNames.Mode
  | NetworkNames.OpBNB
  | NetworkNames.Scroll
  | NetworkNames.Rari
  | NetworkNames.Gravity
  | NetworkNames.Unichain
  | NetworkNames.Abstract
  | NetworkNames.Bera
  | NetworkNames.Ink
  | NetworkNames.Story
  | NetworkNames.Base
  | NetworkNames.ImmutableZkevm
  | NetworkNames.Conflux;
