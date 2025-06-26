import BitcoinNetworks from '@/providers/bitcoin/networks';
import Bitcoin from '@/providers/bitcoin/networks/bitcoin';
import EthereumNetworks from '@/providers/ethereum/networks';
import Ethereum from '@/providers/ethereum/networks/eth';
import { CustomEvmNetwork } from '@/providers/ethereum/types/custom-evm-network';
import KadenaNetworks from '@/providers/kadena/networks';
import Kadena from '@/providers/kadena/networks/kadena';
import MultiversXNetworks from '@/providers/multiversx/networks';
import MultiversX from '@/providers/multiversx/networks/multiversx';
import PolkadotNetworks from '@/providers/polkadot/networks';
import Polkadot from '@/providers/polkadot/networks/polkadot';
import SolanaNetworks from '@/providers/solana/networks';
import Solana from '@/providers/solana/networks/solana';
import { BaseNetwork } from '@/types/base-network';
import { ProviderName } from '@/types/provider';
import { NetworkNames } from '@enkryptcom/types';
import CustomNetworksState from '../custom-networks-state';

const providerNetworks: Record<ProviderName, Record<string, BaseNetwork>> = {
  [ProviderName.ethereum]: EthereumNetworks,
  [ProviderName.polkadot]: PolkadotNetworks,
  [ProviderName.bitcoin]: BitcoinNetworks,
  [ProviderName.kadena]: KadenaNetworks,
  [ProviderName.solana]: SolanaNetworks,
  [ProviderName.multiversx]: MultiversXNetworks,
  [ProviderName.enkrypt]: {},
};
const getAllNetworks = async (
  includeCustom: boolean = true,
): Promise<BaseNetwork[]> => {
  const customNetworksState = new CustomNetworksState();

  const customNetworks = (
    await customNetworksState.getAllCustomEVMNetworks()
  ).map(options => new CustomEvmNetwork(options));
  const allNetworks = (Object.values(EthereumNetworks) as BaseNetwork[])
    .concat(Object.values(PolkadotNetworks) as BaseNetwork[])
    .concat(Object.values(BitcoinNetworks) as BaseNetwork[])
    .concat(Object.values(KadenaNetworks) as BaseNetwork[])
    .concat(Object.values(SolanaNetworks) as BaseNetwork[])
    .concat(Object.values(MultiversXNetworks) as BaseNetwork[]);
  if (!includeCustom) {
    return allNetworks;
  }
  return allNetworks.concat(customNetworks);
};
const getNetworkByName = async (
  name: string,
): Promise<BaseNetwork | undefined> => {
  return (await getAllNetworks()).find(net => net.name === name);
};
const getProviderNetworkByName = async (
  provider: ProviderName,
  networkName: string,
): Promise<BaseNetwork | undefined> => {
  let networks = Object.values(providerNetworks[provider]);

  if (provider === ProviderName.ethereum) {
    const customNetworkState = new CustomNetworksState();
    const customNetworks = (
      await customNetworkState.getAllCustomEVMNetworks()
    ).map(options => new CustomEvmNetwork(options));

    networks = [...customNetworks, ...networks];
  }

  return networks.find(net => net.name === networkName);
};
const DEFAULT_EVM_NETWORK_NAME = NetworkNames.Ethereum;
const DEFAULT_SUBSTRATE_NETWORK_NAME = NetworkNames.Polkadot;
const DEFAULT_BTC_NETWORK_NAME = NetworkNames.Bitcoin;
const DEFAULT_KADENA_NETWORK_NAME = NetworkNames.Kadena;
const DEFAULT_SOLANA_NETWORK_NAME = NetworkNames.Solana;
const DEFAULT_MULTIVERSX_NETWORK_NAME = NetworkNames.MultiversX;

const DEFAULT_EVM_NETWORK = Ethereum;
const DEFAULT_SUBSTRATE_NETWORK = Polkadot;
const DEFAULT_BTC_NETWORK = Bitcoin;
const DEFAULT_KADENA_NETWORK = Kadena;
const DEFAULT_SOLANA_NETWORK = Solana;
const DEFAULT_MULTIVERSX_NETWORK = MultiversX;

const POPULAR_NAMES = [
  NetworkNames.Bitcoin,
  NetworkNames.Ethereum,
  NetworkNames.Solana,
  NetworkNames.Matic,
  NetworkNames.Polkadot,
  NetworkNames.Binance,
  NetworkNames.Rootstock,
  NetworkNames.Optimism,
  NetworkNames.Arbitrum,
  NetworkNames.MultiversX,
];
export {
  DEFAULT_BTC_NETWORK,
  DEFAULT_BTC_NETWORK_NAME,
  DEFAULT_EVM_NETWORK,
  DEFAULT_EVM_NETWORK_NAME,
  DEFAULT_KADENA_NETWORK,
  DEFAULT_KADENA_NETWORK_NAME,
  DEFAULT_MULTIVERSX_NETWORK,
  DEFAULT_MULTIVERSX_NETWORK_NAME,
  DEFAULT_SOLANA_NETWORK,
  DEFAULT_SOLANA_NETWORK_NAME,
  DEFAULT_SUBSTRATE_NETWORK,
  DEFAULT_SUBSTRATE_NETWORK_NAME,
  getAllNetworks,
  getNetworkByName,
  getProviderNetworkByName,
  POPULAR_NAMES,
};
