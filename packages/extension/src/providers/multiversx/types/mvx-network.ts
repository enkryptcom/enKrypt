import createIcon from '@/providers/ethereum/libs/blockies';
import { Activity } from '@/types/activity';
import { BaseNetwork, BaseNetworkOptions } from '@/types/base-network';
import { AssetsType, ProviderName } from '@/types/provider';
import { CoingeckoPlatform, NetworkNames, SignerType } from '@enkryptcom/types';
import { Address } from '@multiversx/sdk-core';
import API from '../libs/api';

export interface MultiversXNetworkOptions {
  name: NetworkNames;
  name_long: string;
  homePage: string;
  blockExplorerTX: string;
  blockExplorerAddr: string;
  isTestNetwork: boolean;
  currencyName: string;
  currencyNameLong: string;
  icon: string;
  decimals: number;
  node: string;
  coingeckoID?: string;
  coingeckoPlatform: CoingeckoPlatform;
  basePath: string;
  activityHandler: (
    network: BaseNetwork,
    address: string,
  ) => Promise<Activity[]>;
  assetsInfoHandler?: (
    network: BaseNetwork,
    address: string,
  ) => Promise<AssetsType[]>;
}

export const getAddress = (pubkey: string) => {
  return new Address(pubkey).toBech32();
};

export class MultiversXNetwork extends BaseNetwork {
  constructor(options: MultiversXNetworkOptions) {
    const api = async () => {
      const api = new API(options.node);
      await api.init();
      return api as API;
    };

    const baseOptions: BaseNetworkOptions = {
      identicon: createIcon,
      signer: [SignerType.ed25519mvx],
      provider: ProviderName.multiversx,
      displayAddress: getAddress,
      api,
      ...options,
    };
    super(baseOptions);
  }

  public getAllTokens(address: string): Promise<BaseToken[]> {}

  public getAllTokenInfo(address: string): Promise<AssetsType[]> {
    throw new Error('Method not implemented.');
  }

  public getAllActivity(address: string): Promise<Activity[]> {
    throw new Error('Method not implemented.');
  }
}
