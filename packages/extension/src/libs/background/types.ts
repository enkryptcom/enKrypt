import BitcoinProvider from '@/providers/bitcoin';
import type EthereumProvider from '@/providers/ethereum';
import type KadenaProvider from '@/providers/kadena';
import MassaProvider from '@/providers/massa';
import MultiversXProvider from '@/providers/multiversx';
import type PolkadotProvider from '@/providers/polkadot';
import SolanaProvider from '@/providers/solana';

export interface TabProviderType {
  [key: string]: Record<
    number,
    | EthereumProvider
    | PolkadotProvider
    | BitcoinProvider
    | KadenaProvider
    | SolanaProvider
    | MultiversXProvider
    | MassaProvider
  >;
}
export interface ProviderType {
  [key: string]:
    | typeof EthereumProvider
    | typeof PolkadotProvider
    | typeof BitcoinProvider
    | typeof KadenaProvider
    | typeof SolanaProvider
    | typeof MultiversXProvider
    | typeof MassaProvider;
}
export interface ExternalMessageOptions {
  savePersistentEvents: boolean;
}
