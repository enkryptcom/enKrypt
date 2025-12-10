import icon from './icons/rootstock.webp';
import { NetworkNames } from '@enkryptcom/types';
import { EvmNetwork, EvmNetworkOptions } from '../types/evm-network';
import { EtherscanActivity } from '../libs/activity-handlers';
import wrapActivityHandler from '@/libs/activity-state/wrap-activity-handler';
import {
  toChecksumAddress,
  isValidChecksumAddress,
  isValidAddress,
} from '@ethereumjs/util';

const rootstockTestnetOptions: EvmNetworkOptions = {
  name: NetworkNames.RootstockTestnet,
  name_long: 'Rootstock Testnet',
  homePage: 'https://rootstock.io/',
  blockExplorerTX: 'https://explorer.testnet.rootstock.io/tx/[[txHash]]',
  blockExplorerAddr:
    'https://explorer.testnet.rootstock.io/address/[[address]]',
  chainID: '0x1f',
  isTestNetwork: true,
  currencyName: 'tRBTC',
  currencyNameLong: 'Rootstock Testnet',
  node: 'wss://nodes.mewapi.io/ws/rsktest',
  icon,
  basePath: "m/44'/37310'/0'/0",
  activityHandler: wrapActivityHandler(EtherscanActivity),
};

rootstockTestnetOptions.displayAddress = (address: string) => {
  return toChecksumAddress(address, rootstockTestnetOptions.chainID);
};
rootstockTestnetOptions.isAddress = (address: string) => {
  return (
    isValidAddress(address) ||
    isValidChecksumAddress(address, rootstockTestnetOptions.chainID)
  );
};

const rootstockTestnet = new EvmNetwork(rootstockTestnetOptions);

export default rootstockTestnet;
