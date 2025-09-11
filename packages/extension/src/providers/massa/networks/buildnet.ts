import { NetworkNames } from '@enkryptcom/types';
import { MassaNetwork, createMassaNetworkOptions } from './massa-base';
import { CHAIN_ID, PublicApiUrl } from '@massalabs/massa-web3';

const buildnetOptions = createMassaNetworkOptions({
  name: NetworkNames.MassaBuildnet,
  name_long: 'Massa Buildnet',
  blockExplorerTX: 'https://www.massexplo.com/tx/[[txHash]]?network=buildnet',
  blockExplorerAddr:
    'https://www.massexplo.com/address/[[address]]?network=buildnet',
  isTestNetwork: true,
  node: PublicApiUrl.Buildnet,
  chainId: CHAIN_ID.Buildnet,
  coingeckoID: 'massa',
});

const buildnet = new MassaNetwork(buildnetOptions);

export default buildnet;
