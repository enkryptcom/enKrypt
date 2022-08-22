import { ProviderName } from "@/types/provider";
import { NetworkNames } from "@enkryptcom/types";
import EthereumNetworks from "@/providers/ethereum/networks";
import PolkadotNetworks from "@/providers/polkadot/networks";
import { BaseNetwork } from "@/types/base-network";
const providerNetworks: Record<ProviderName, Record<string, BaseNetwork>> = {
  [ProviderName.ethereum]: EthereumNetworks,
  [ProviderName.polkadot]: PolkadotNetworks,
  [ProviderName.enkrypt]: {},
};
const getAllNetworks = (): BaseNetwork[] => {
  return (Object.values(EthereumNetworks) as BaseNetwork[]).concat(
    Object.values(PolkadotNetworks) as BaseNetwork[]
  );
};
const getNetworkByName = (name: string): BaseNetwork | undefined => {
  return getAllNetworks().find((net) => net.name === name);
};
const getProviderNetworkByName = (
  provider: ProviderName,
  networkName: string
): BaseNetwork | undefined => {
  return (Object.values(providerNetworks[provider]) as BaseNetwork[]).find(
    (net) => net.name === networkName
  );
};
const DEFAULT_EVM_NETWORK_NAME = NetworkNames.Ethereum;
const DEFAULT_SUBSTRATE_NETWORK_NAME = NetworkNames.Polkadot;
const POPULAR_NAMES = [
  NetworkNames.Okc,
  NetworkNames.OkcTestnet,
  NetworkNames.Ethereum,
  NetworkNames.Matic,
  NetworkNames.Polkadot,
  NetworkNames.Moonbeam,
  NetworkNames.Acala,
];
export {
  getAllNetworks,
  getNetworkByName,
  getProviderNetworkByName,
  DEFAULT_EVM_NETWORK_NAME,
  DEFAULT_SUBSTRATE_NETWORK_NAME,
  POPULAR_NAMES,
};
