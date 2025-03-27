import icon from './icons/caga.webp';
import { NetworkNames } from '@enkryptcom/types';
import { EvmNetwork, EvmNetworkOptions } from '../types/evm-network';
import wrapActivityHandler from '@/libs/activity-state/wrap-activity-handler';

const cagaTestOptions: EvmNetworkOptions = {
  name: NetworkNames.CagaAnkara,
  name_long: 'CAGA Ankara Testnet',
  homePage: 'https://www.cagacrypto.com/',
  blockExplorerTX:
    'https://explorer.ankara-cagacrypto.com/transaction/[[txHash]]',
  blockExplorerAddr:
    'https://explorer.ankara-cagacrypto.com/address/[[address]]',
  chainID: '0x11c4a',
  isTestNetwork: true,
  currencyName: 'CAGA',
  currencyNameLong: 'CAGA',
  node: 'wss://wss.ankara-cagacrypto.com',
  icon,
  activityHandler: wrapActivityHandler(() => Promise.resolve([])),
};

const cagaAnkara = new EvmNetwork(cagaTestOptions);

export default cagaAnkara;
