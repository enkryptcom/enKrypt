import { NetworkNames } from '@enkryptcom/types';

const NetworkEndpoints = {
  [NetworkNames.Kadena]: 'https://estats.chainweb.com/',
  [NetworkNames.KadenaTestnet]: 'https://estats.testnet.chainweb.com/',
};

const NetworkTtls = {
  [NetworkNames.Kadena]: 30000,
  [NetworkNames.KadenaTestnet]: 30000,
};

export { NetworkEndpoints, NetworkTtls };
