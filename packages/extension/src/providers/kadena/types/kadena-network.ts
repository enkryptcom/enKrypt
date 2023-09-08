import { Activity } from "@/types/activity";
import { BaseNetwork, BaseNetworkOptions } from "@/types/base-network";
import { BaseToken } from "@/types/base-token";
import { AssetsType, ProviderName } from "@/types/provider";
import { CoingeckoPlatform, NetworkNames, SignerType } from "@enkryptcom/types";
import KadenaAPI from "@/providers/kadena/libs/api";

import createIcon from "../libs/blockies";

export interface KadenaNetworkOptions {
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
  prefix: number;
  node: string;
  coingeckoID?: string;
  coingeckoPlatform?: CoingeckoPlatform;
}

export class KadenaNetwork extends BaseNetwork {
  constructor(options: KadenaNetworkOptions) {
    const api = async () => {
      const api = new KadenaAPI(options.node);
      return api;
    };

    const baseOptions: BaseNetworkOptions = {
      basePath: "//",
      identicon: createIcon,
      signer: [SignerType.ed25519kda],
      displayAddress: (address: string) => address,
      provider: ProviderName.kadena,
      api,
      ...options,
    };

    super(baseOptions);
  }

  public getAllTokens(address: string): Promise<BaseToken[]> {
    console.log("KadenaNetwork::getAllTokens", address);
    return Promise.resolve([]);
  }

  public getAllTokenInfo(address: string): Promise<AssetsType[]> {
    console.log("KadenaNetwork::getAllTokenInfo", address);
    return Promise.resolve([]);
  }

  public getAllActivity(address: string): Promise<Activity[]> {
    console.log("KadenaNetwork::getAllActivity", address);
    return Promise.resolve([]);
  }
}
