import { ProviderName } from "@/types/provider";
import { NetworkNames } from "@enkryptcom/types";
import EthereumNetworks from "@/providers/ethereum/networks";
import PolkadotNetworks from "@/providers/polkadot/networks";
import BitcoinNetworks from "@/providers/bitcoin/networks";
import { BaseNetwork } from "@/types/base-network";
import CustomNetworksState from "../custom-networks-state";
import { CustomEvmNetwork } from "@/providers/ethereum/types/custom-evm-network";
import Ethereum from "@/providers/ethereum/networks/eth";
import Polkadot from "@/providers/polkadot/networks/polkadot";
import Bitcoin from "@/providers/bitcoin/networks/bitcoin";

const providerNetworks: Record<ProviderName, Record<string, BaseNetwork>> = {
  [ProviderName.ethereum]: EthereumNetworks,
  [ProviderName.polkadot]: PolkadotNetworks,
  [ProviderName.bitcoin]: BitcoinNetworks,
  [ProviderName.enkrypt]: {},
};
const getAllNetworks = async (): Promise<BaseNetwork[]> => {
  const customNetworksState = new CustomNetworksState();

  const customNetworks = (
    await customNetworksState.getAllCustomEVMNetworks()
  ).map((options) => new CustomEvmNetwork(options));

  return (Object.values(EthereumNetworks) as BaseNetwork[])
    .concat(Object.values(PolkadotNetworks) as BaseNetwork[])
    .concat(Object.values(BitcoinNetworks) as BaseNetwork[])
    .concat(customNetworks);
};
const getNetworkByName = async (
  name: string
): Promise<BaseNetwork | undefined> => {
  return (await getAllNetworks()).find((net) => net.name === name);
};
const getProviderNetworkByName = async (
  provider: ProviderName,
  networkName: string
): Promise<BaseNetwork | undefined> => {
  let networks = Object.values(providerNetworks[provider]);

  if (provider === ProviderName.ethereum) {
    const customNetworkState = new CustomNetworksState();
    const customNetworks = (
      await customNetworkState.getAllCustomEVMNetworks()
    ).map((options) => new CustomEvmNetwork(options));

    networks = [...customNetworks, ...networks];
  }

  return networks.find((net) => net.name === networkName);
};
const DEFAULT_EVM_NETWORK_NAME = NetworkNames.Ethereum;
const DEFAULT_SUBSTRATE_NETWORK_NAME = NetworkNames.Polkadot;
const DEFAULT_BTC_NETWORK_NAME = NetworkNames.Bitcoin;

const DEFAULT_EVM_NETWORK = Ethereum;
const DEFAULT_SUBSTRATE_NETWORK = Polkadot;
const DEFAULT_BTC_NETWORK = Bitcoin;

const POPULAR_NAMES = [
  NetworkNames.Bitcoin,
  NetworkNames.Ethereum,
  NetworkNames.Matic,
  NetworkNames.Polkadot,
  NetworkNames.Binance,
  NetworkNames.Rootstock,
  NetworkNames.Optimism,
];
export {
  getAllNetworks,
  getNetworkByName,
  getProviderNetworkByName,
  DEFAULT_EVM_NETWORK_NAME,
  DEFAULT_SUBSTRATE_NETWORK_NAME,
  DEFAULT_BTC_NETWORK_NAME,
  POPULAR_NAMES,
  DEFAULT_EVM_NETWORK,
  DEFAULT_SUBSTRATE_NETWORK,
  DEFAULT_BTC_NETWORK,
};
