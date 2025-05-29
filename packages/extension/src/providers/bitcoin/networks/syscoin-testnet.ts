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

const syscoinTestnetOptions: BitcoinNetworkOptions = {
  name: NetworkNames.SyscoinUTXOTest,
  name_long: 'Syscoin UTXO Testnet',
  homePage: 'https://syscoin.org/',
  blockExplorerTX: 'https://explorer-blockbook-dev.syscoin.org/tx/[[txHash]]',
  blockExplorerAddr: 'https://explorer-blockbook-dev.syscoin.org/tx/address/[[address]]',
  isTestNetwork: true,
  currencyName: 'TSYS',
  currencyNameLong: 'Syscoin Testnet',
  icon,
  decimals: 8,
  node: 'https://blockbook-dev.syscoin.org/',
  coingeckoID: 'syscoin',
  dust: 0.0001,
  apiType: SSApi,
  activityHandler: wrapActivityHandler(ssHandler),
  basePath: "m/84'/57'/0'/0",
  feeHandler: () => {
    return SSFeeHandler('https://blockbook-dev.syscoin.org/api/v2/fees');
  },
  networkInfo: {
    name: NetworkNames.SyscoinUTXOTest,
    messagePrefix: '\x18Syscoin Signed Message:\n',
    bech32: 'tsys',
    bip32: {
      public: 0x043587cf,
      private: 0x04358394,
    },
    pubKeyHash: 0x41,
    scriptHash: 0xc4,
    wif: 0xef,
    dustThreshold: null,
    paymentType: PaymentType.P2WPKH,
    maxFeeRate: 5000 * 2,
  },
};

const syscoinTestnet = new BitcoinNetwork(syscoinTestnetOptions);

export default syscoinTestnet;
