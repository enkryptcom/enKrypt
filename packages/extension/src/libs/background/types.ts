import BitcoinProvider from '@/providers/bitcoin';
import type EthereumProvider from '@/providers/ethereum';
import type PolkadotProvider from '@/providers/polkadot';
import type KadenaProvider from '@/providers/kadena';
import SolanaProvider from '@/providers/solana';

export interface TabProviderType {
  [key: string]: Record<
    number,
    | EthereumProvider
    | PolkadotProvider
    | BitcoinProvider
    | KadenaProvider
    | SolanaProvider
  >;
}
export interface ProviderType {
  [key: string]:
    | typeof EthereumProvider
    | typeof PolkadotProvider
    | typeof BitcoinProvider
    | typeof KadenaProvider
    | typeof SolanaProvider;
}
export interface ExternalMessageOptions {
  savePersistentEvents: boolean;
}
