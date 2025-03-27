import icon from './icons/form.webp';
import { NetworkNames } from '@enkryptcom/types';
import { EvmNetwork, EvmNetworkOptions } from '../types/evm-network';
import wrapActivityHandler from '@/libs/activity-state/wrap-activity-handler';
import { EtherscanActivity } from '../libs/activity-handlers';

const formTestnetOptions: EvmNetworkOptions = {
  name: NetworkNames.FormTestnet,
  name_long: 'Form Testnet',
  homePage: 'https://docs.form.network',
  blockExplorerTX: 'https://testnet-explorer.form.network/tx/[[txHash]]',
  blockExplorerAddr:
    'https://testnet-explorer.form.network/address/[[address]]',
  chainID: '0x20726',
  isTestNetwork: true,
  currencyName: 'ETH',
  currencyNameLong: 'Ethereum',
  node: 'wss://testnet-rpc.form.network/ws',
  icon,
  activityHandler: wrapActivityHandler(EtherscanActivity),
};

const formTestnet = new EvmNetwork(formTestnetOptions);

export default formTestnet;
