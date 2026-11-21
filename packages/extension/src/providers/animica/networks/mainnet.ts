import { NetworkNames } from '@enkryptcom/types';
import { AnimicaNetwork, createAnimicaNetworkOptions } from './animica-base';

const mainnetOptions = createAnimicaNetworkOptions({
  name: NetworkNames.Animica,
  name_long: 'Animica',
  blockExplorerTX: 'https://explorer.animica.org/tx/[[txHash]]',
  blockExplorerAddr: 'https://explorer.animica.org/address/[[address]]',
  isTestNetwork: false,
  node: 'https://rpc.animica.org/rpc',
  explorerApi: 'https://explorer.animica.org/api',
  chainId: 1,
  genesisHash:
    '0xa0892158cf997c56e91d0aa12e60c36037dae34800a2b54111a8fa17ec88b7de',
  forkId: 3511060514,
});

const mainnet = new AnimicaNetwork(mainnetOptions);

export default mainnet;
