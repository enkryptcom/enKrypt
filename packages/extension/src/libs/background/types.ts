import BitcoinProvider from '@/providers/bitcoin';
import type EthereumProvider from '@/providers/ethereum';
import type PolkadotProvider from '@/providers/polkadot';
import type KadenaProvider from '@/providers/kadena';
import SolanaProvider from '@/providers/solana';
import MassaProvider from '@/providers/massa';
import AnimicaProvider from '@/providers/animica';

export interface TabProviderType {
  [key: string]: Record<
    number,
    | EthereumProvider
    | PolkadotProvider
    | BitcoinProvider
    | KadenaProvider
    | SolanaProvider
    | MassaProvider
    | AnimicaProvider
  >;
}
export interface ProviderType {
  [key: string]:
    | typeof EthereumProvider
    | typeof PolkadotProvider
    | typeof BitcoinProvider
    | typeof KadenaProvider
    | typeof SolanaProvider
    | typeof MassaProvider
    | typeof AnimicaProvider;
}
export interface ExternalMessageOptions {
  savePersistentEvents: boolean;
}
