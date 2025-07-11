import { NetworkNames } from '@enkryptcom/types';

const NetworkEndpoint = {
  [NetworkNames.MultiversX]: 'https://devnet-api.multiversx.com',
};

const NetworkTtl = {
  [NetworkNames.MultiversX]: 300000,
};

export { NetworkEndpoint, NetworkTtl };
