import icon from './icons/bitrock.svg';
import { CoingeckoPlatform, NetworkNames } from '@enkryptcom/types';
import { EvmNetwork, EvmNetworkOptions } from '../types/evm-network';

const bitrockOptions: EvmNetworkOptions = {
  name: NetworkNames.Bitrock,
  name_long: 'Bitrock Chain',
  homePage: 'https://bit-rock.io/',
  blockExplorerTX: 'https://explorer.bit-rock.io/tx/[[txHash]]',
  blockExplorerAddr: 'https://explorer.bit-rock.io/address/[[address]]',
  chainID: '0x1c03',
  isTestNetwork: false,
  currencyName: 'BROCK',
  currencyNameLong: 'Bitrock',
  node: 'https://brockrpc.io',
  icon,
  coingeckoID: 'bitrock',
  coingeckoPlatform: CoingeckoPlatform.Bitrock,
  activityHandler: () => Promise.resolve([]),
};

const bitrock = new EvmNetwork(bitrockOptions);

export default bitrock;
