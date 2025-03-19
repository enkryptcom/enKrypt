import { NetworkNames } from '@enkryptcom/types';
import { KadenaNetwork, KadenaNetworkOptions } from '../types/kadena-network';
import wrapActivityHandler from '@/libs/activity-state/wrap-activity-handler';
import { kadenaScanActivity } from '../libs/activity-handlers';
import { isValidAddress } from '../libs/network';
import icon from './icons/kadena-kda-logo.webp';

const kadenaOptions: KadenaNetworkOptions = {
  name: NetworkNames.KadenaTestnet,
  name_long: 'Kadena Testnet',
  homePage: 'https://kadena.io/',
  blockExplorerTX: 'https://explorer.chainweb.com/testnet/tx/[[txHash]]',
  blockExplorerAddr:
    'https://explorer.chainweb.com/testnet/account/[[address]]?token=coin',
  isTestNetwork: true,
  currencyName: 'KDA',
  currencyNameLong: 'Kadena',
  icon,
  decimals: 12,
  prefix: 0,
  node: 'https://api.testnet.chainweb.com/chainweb/0.0',
  kadenaApiOptions: {
    networkId: 'testnet04',
    chainId: '1',
  },
  subNetworks: Array(20)
    .fill('')
    .map((_, idx) => {
      return {
        id: idx.toString(),
        name: `Chain ${idx}`,
      };
    }),
  buyLink: 'https://tools.kadena.io/faucet/new',
  activityHandler: wrapActivityHandler(kadenaScanActivity),
  displayAddress: (address: string) => address.replace('0x', 'k:'),
  isAddress: isValidAddress,
};

const kadenaTestnet = new KadenaNetwork(kadenaOptions);

export default kadenaTestnet;
