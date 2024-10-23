import { NetworkNames } from '@enkryptcom/types';

const NetworkEndpoints = {
  [NetworkNames.Ethereum]: 'https://nodes.mewapi.io/rpc/eth',
  [NetworkNames.Sepolia]: 'https://nodes.mewapi.io/rpc/sepolia',
  [NetworkNames.EthereumClassic]: 'https://nodes.mewapi.io/rpc/etc',
};

export { NetworkEndpoints };
