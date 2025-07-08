import { NetworkNames } from '@enkryptcom/types';
import { CHAIN_ID, PublicApiUrl } from '@massalabs/massa-web3';
import { MassaNetwork, createMassaNetworkOptions } from './massa-base';

const mainnetOptions = createMassaNetworkOptions({
  name: NetworkNames.Massa,
  name_long: 'Massa',
  blockExplorerTX: 'https://explorer.massa.net/operation/[[txHash]]',
  blockExplorerAddr: 'https://explorer.massa.net/address/[[address]]',
  isTestNetwork: false,
  node: PublicApiUrl.Mainnet,
  chainId: CHAIN_ID.Mainnet,
  coingeckoID: 'massa',
});

const mainnet = new MassaNetwork(mainnetOptions);

export default mainnet;
