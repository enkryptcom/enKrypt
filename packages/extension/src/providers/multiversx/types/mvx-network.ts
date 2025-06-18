import { Activity } from '@/types/activity';
import { BaseNetwork, BaseNetworkOptions } from '@/types/base-network';
import { AssetsType } from '@/types/provider';
import API from '../libs/api';

export interface MultiversXNetworkOptions extends BaseNetworkOptions {
  activityHandler: (
    network: BaseNetwork,
    address: string,
  ) => Promise<Activity[]>;
  assetsInfoHandler?: (
    network: BaseNetwork,
    address: string,
  ) => Promise<AssetsType[]>;
}

export class MultiversXNetwork extends BaseNetwork {
  constructor(options: MultiversXNetworkOptions) {
    const api = async () => {
      const api = new API(options.node);
      await api.init();
      return api as API;
    };
  }
}
