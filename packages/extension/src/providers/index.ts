import EthereumProvider from '@/providers/ethereum';
import PolkadotProvider from '@/providers/polkadot';
import BitcoinProvider from '@/providers/bitcoin';
import KadenaProvider from '@/providers/kadena';
import SolanaProvider from '@/providers/solana';
import { ProviderName } from '@/types/provider';

export default {
  [ProviderName.ethereum]: EthereumProvider,
  [ProviderName.polkadot]: PolkadotProvider,
  [ProviderName.bitcoin]: BitcoinProvider,
  [ProviderName.kadena]: KadenaProvider,
  [ProviderName.solana]: SolanaProvider,
};
