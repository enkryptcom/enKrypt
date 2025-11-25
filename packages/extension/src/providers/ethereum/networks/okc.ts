import icon from './icons/okc.webp';
import { CoingeckoPlatform, NetworkNames } from '@enkryptcom/types';
import { EvmNetwork, EvmNetworkOptions } from '../types/evm-network';
import wrapActivityHandler from '@/libs/activity-state/wrap-activity-handler';

const okcOptions: EvmNetworkOptions = {
  name: NetworkNames.Okc,
  name_long: 'OKT Chain',
  homePage: 'https://www.okx.com/oktc',
  blockExplorerTX: 'https://www.oklink.com/oktc/tx/[[txHash]]',
  blockExplorerAddr: 'https://www.oklink.com/oktc/address/[[address]]',
  chainID: '0x42',
  isTestNetwork: false,
  currencyName: 'OKT',
  currencyNameLong: 'OKT Chain',
  node: 'https://exchainrpc.okex.org',
  icon,
  coingeckoID: 'oec-token',
  coingeckoPlatform: CoingeckoPlatform.Okc,
  activityHandler: wrapActivityHandler(() => Promise.resolve([])),
};

const okc = new EvmNetwork(okcOptions);

export default okc;
