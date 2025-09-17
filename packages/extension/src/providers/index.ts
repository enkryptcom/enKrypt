import BitcoinProvider from '@/providers/bitcoin';
import EthereumProvider from '@/providers/ethereum';
import KadenaProvider from '@/providers/kadena';
import MassaProvider from '@/providers/massa';
import MultiversXProvider from '@/providers/multiversx';
import PolkadotProvider from '@/providers/polkadot';
import SolanaProvider from '@/providers/solana';
import { ProviderName } from '@/types/provider';

export default {
  [ProviderName.ethereum]: EthereumProvider,
  [ProviderName.polkadot]: PolkadotProvider,
  [ProviderName.bitcoin]: BitcoinProvider,
  [ProviderName.kadena]: KadenaProvider,
  [ProviderName.solana]: SolanaProvider,
  [ProviderName.multiversx]: MultiversXProvider,
  [ProviderName.massa]: MassaProvider,
};
