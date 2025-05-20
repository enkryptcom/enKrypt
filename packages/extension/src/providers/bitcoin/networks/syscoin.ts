import icon from './icons/sys.webp';
import { NetworkNames } from '@enkryptcom/types';
import {
  BitcoinNetwork,
  BitcoinNetworkOptions,
  PaymentType,
} from '../types/bitcoin-network';
import { ssHandler } from '../libs/activity-handlers';
import wrapActivityHandler from '@/libs/activity-state/wrap-activity-handler';
import SSFeeHandler from '../libs/ss-fee-handler';
import SSApi from '../libs/api-ss';

const syscoinOptions: BitcoinNetworkOptions = {
  name: NetworkNames.SyscoinUTXO,
  name_long: 'Syscoin UTXO',
  homePage: 'https://syscoin.org/',
  blockExplorerTX: 'https://explorer-blockbook.syscoin.org/tx/tx/[[txHash]]',
  blockExplorerAddr: 'https://explorer-blockbook.syscoin.org/tx/address/[[address]]',
  isTestNetwork: false,
  currencyName: 'SYS',
  currencyNameLong: 'Syscoin',
  icon,
  decimals: 8,
  node: 'https://blockbook.syscoin.org/',
  coingeckoID: 'syscoin',
  dust: 0.0001,
  apiType: SSApi,
  activityHandler: wrapActivityHandler(ssHandler),
  basePath: "m/84'/57'/0'/0",
  feeHandler: () => {
    return SSFeeHandler('https://blockbook.syscoin.org/api/v1/fees');
  },
  networkInfo: {
    name: NetworkNames.SyscoinUTXO,
    messagePrefix: '\x18Syscoin Signed Message:\n',
    bech32: 'sys',
    bip32: {
      public: 0x0488b21e,
      private: 0x0488ade4,
    },
    pubKeyHash: 0x3f,
    scriptHash: 0x05,
    wif: 0x80,
    dustThreshold: null,
    paymentType: PaymentType.P2WPKH,
    maxFeeRate: 5000 * 2,
  },
};

const syscoin = new BitcoinNetwork(syscoinOptions);

export default syscoin;
