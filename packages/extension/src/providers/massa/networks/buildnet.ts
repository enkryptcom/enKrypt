import { NetworkNames } from '@enkryptcom/types';
import { BaseNetwork } from '@/types/base-network';
import MassaAPI from '../libs/api';
import { SignerType } from '@enkryptcom/types';
import { ProviderName } from '@/types/provider';
import createIcon from '../libs/blockies';
import { CHAIN_ID, PublicApiUrl } from '@massalabs/massa-web3';
import { MassaNetworkOptions } from '../types';
import icon from './icons/Massa_logo.webp';

const buildnetOptions: MassaNetworkOptions = {
  name: NetworkNames.MassaBuildnet,
  name_long: 'Massa Buildnet',
  homePage: 'https://massa.net/',
  blockExplorerTX: 'https://www.massexplo.com/tx/[[txHash]]?network=buildnet',
  blockExplorerAddr: 'https://www.massexplo.com/address/[[address]]?network=buildnet',
  isTestNetwork: true,
  currencyName: 'MAS',
  currencyNameLong: 'Massa',
  node: PublicApiUrl.Buildnet,
  icon,
  decimals: 9,
  signer: [SignerType.ed25519mas],
  displayAddress: (address: string) => address,
  provider: ProviderName.massa,
  identicon: createIcon,
  basePath: "m/44'/632'",
  chainId: CHAIN_ID.Buildnet,
  api: async () => {
    const api = new MassaAPI(PublicApiUrl.Buildnet);
    await api.init();
    return api;
  },
};

class MassaNetwork extends BaseNetwork {
  constructor(options: MassaNetworkOptions) {
    super(options);
  }

  async getAllTokens(): Promise<any[]> {
    return [];
  }

  async getAllTokenInfo(): Promise<any[]> {
    return [];
  }

  async getAllActivity(): Promise<any[]> {
    return [];
  }
}

const buildnet = new MassaNetwork(buildnetOptions);

export default buildnet; 