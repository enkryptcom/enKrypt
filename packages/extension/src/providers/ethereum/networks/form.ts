import icon from './icons/form.webp';
import { NetworkNames } from '@enkryptcom/types';
import { EvmNetwork, EvmNetworkOptions } from '../types/evm-network';
import wrapActivityHandler from '@/libs/activity-state/wrap-activity-handler';
import { EtherscanActivity } from '../libs/activity-handlers';

const formOptions: EvmNetworkOptions = {
  name: NetworkNames.Form,
  name_long: 'Form Mainnet',
  homePage: 'https://docs.form.network',
  blockExplorerTX: 'https://explorer.form.network/tx/[[txHash]]',
  blockExplorerAddr: 'https://explorer.form.network/address/[[address]]',
  chainID: '0x1de',
  isTestNetwork: false,
  currencyName: 'ETH',
  currencyNameLong: 'Ethereum',
  node: 'wss://rpc.form.network/ws',
  icon,
  activityHandler: wrapActivityHandler(EtherscanActivity),
};

const form = new EvmNetwork(formOptions);

export default form;
