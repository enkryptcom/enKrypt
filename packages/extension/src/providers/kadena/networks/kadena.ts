import { CoingeckoPlatform, NetworkNames } from '@enkryptcom/types';
import { KadenaNetwork, KadenaNetworkOptions } from '../types/kadena-network';
import wrapActivityHandler from '@/libs/activity-state/wrap-activity-handler';
import { kadenaScanActivity } from '../libs/activity-handlers';
import { isValidAddress } from '../libs/network';
import icon from './icons/kadena-kda-logo.webp';

const kadenaOptions: KadenaNetworkOptions = {
  name: NetworkNames.Kadena,
  name_long: 'Kadena',
  homePage: 'https://kadena.io/',
  blockExplorerTX: 'https://explorer.chainweb.com/mainnet/tx/[[txHash]]',
  blockExplorerAddr:
    'https://explorer.chainweb.com/mainnet/account/[[address]]?token=coin',
  isTestNetwork: false,
  currencyName: 'KDA',
  currencyNameLong: 'Kadena',
  icon,
  decimals: 12,
  prefix: 0,
  node: 'https://api.chainweb.com/chainweb/0.0',
  kadenaApiOptions: {
    networkId: 'mainnet01',
    chainId: '1',
  },
  coingeckoID: 'kadena',
  subNetworks: Array(20)
    .fill('')
    .map((_, idx) => {
      return {
        id: idx.toString(),
        name: `Chain ${idx}`,
      };
    }),
  coingeckoPlatform: CoingeckoPlatform.Kadena,
  activityHandler: wrapActivityHandler(kadenaScanActivity),
  displayAddress: (address: string) => address.replace('0x', 'k:'),
  isAddress: isValidAddress,
};

const kadena = new KadenaNetwork(kadenaOptions);

export default kadena;
