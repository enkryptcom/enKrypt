import { NetworkNames } from '@enkryptcom/types';

const NetworkEndpoints: Record<string, string> = {
  [NetworkNames.Nibiru]: 'https://routescan.io',
  [NetworkNames.NibiruTestnet]: 'https://testnet.routescan.io',
};

export { NetworkEndpoints };
