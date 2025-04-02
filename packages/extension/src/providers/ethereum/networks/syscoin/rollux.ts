import icon from '../icons/sys_rollux.webp';
import { NetworkNames, CoingeckoPlatform } from '@enkryptcom/types';
import { EvmNetwork, EvmNetworkOptions } from '../../types/evm-network';
import assetsInfoHandler from "@/providers/ethereum/libs/assets-handlers/assetinfo-mew";
import { EtherscanActivity } from '../../libs/activity-handlers';
import wrapActivityHandler from '@/libs/activity-state/wrap-activity-handler';

const rolluxOptions: EvmNetworkOptions = {
  name: NetworkNames.Rollux,
  name_long: 'Syscoin ROLLUX',
  homePage: 'https://www.rollux.com/',
  blockExplorerTX: 'https://explorer.rollux.com/tx/[[txHash]]',
  blockExplorerAddr: 'https://explorer.rollux.com/address/[[address]]',
  chainID: '0x23a',
  isTestNetwork: false,
  currencyName: 'SYS',
  currencyNameLong: 'Syscoin',
  node: 'wss://rpc.rollux.com/wss',
  coingeckoID: 'syscoin',
  coingeckoPlatform: CoingeckoPlatform.Rollux,
  icon,
  assetsInfoHandler,
  buyLink: 'https://trade.coinify.com/syscoin?defaultCryptoCurrency=SYSROLLUX&cryptoCurrencies=SYSROLLUX,SYSEVM,SYS&targetPage=buy',
  activityHandler: wrapActivityHandler(EtherscanActivity),
};

const rollux = new EvmNetwork(rolluxOptions);

export default rollux;
