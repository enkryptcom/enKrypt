import { NetworkNames } from '@enkryptcom/types';
import { ECashNetworkInfo } from '../types/ecash-chronik';
import { ECashNetwork, createECashNetworkOptions } from './ecash-base';
import icon from './icons/ecash.svg';

const ecashTestnetInfo: ECashNetworkInfo = {
  messagePrefix: '\x18eCash Signed Message:\n',
  bech32: '',
  bip32: {
    public: 0x043587cf,
    private: 0x04358394,
  },
  pubKeyHash: 0x6f,
  scriptHash: 0xc4,
  wif: 0xef,
  cashAddrPrefix: 'ectest',
};

const ecashTestOptions = createECashNetworkOptions({
  name: NetworkNames.ECashTest,
  name_long: 'eCash Testnet',
  homePage: 'https://e.cash/',
  blockExplorerTX: 'https://texplorer.e.cash/tx/[[txHash]]',
  blockExplorerAddr: 'https://texplorer.e.cash/address/ectest:[[address]]',
  isTestNetwork: true,
  currencyName: 'tXEC',
  currencyNameLong: 'Test eCash',
  icon,
  decimals: 2,
  // Public Chronik chipnet (testnet) endpoint
  node: 'https://chronik-testnet.fabien.cash',
  coingeckoID: undefined,
  dust: 546,
  networkInfo: ecashTestnetInfo,
  cashAddrPrefix: 'ectest',
});

const ecashTest = new ECashNetwork(ecashTestOptions);

export default ecashTest;
