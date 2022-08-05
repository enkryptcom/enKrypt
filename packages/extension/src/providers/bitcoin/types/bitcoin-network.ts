import { BaseNetwork, BaseNetworkOptions } from "@/types/base-network";
import BitcoinAPI from "@/providers/bitcoin/libs/api";
import { AssetsType } from "@/types/provider";
import { BaseToken } from "@/types/base-token";
import { ProviderName } from "@/types/provider";
import { NetworkNames, SignerType } from "@enkryptcom/types";
import createIcon from "../libs/blockies";
import { Activity } from "@/types/activity";

export interface BitcoinNetworkOptions {
  name: NetworkNames;
  name_long: string;
  homePage: string;
  blockExplorerTX: string;
  blockExplorerAddr: string;
  isTestNetwork: boolean;
  currencyName: string;
  icon: string;
  decimals: number;
  gradient: string;
  node: string;
  coingeckoID?: string;
  basePath: string;
  activityHandler: (
    network: BaseNetwork,
    address: string
  ) => Promise<Activity[]>;
}

export class BitcoinNetwork extends BaseNetwork {
  public assets: BaseToken[] = [];

  private activityHandler: (
    network: BaseNetwork,
    address: string
  ) => Promise<Activity[]>;
  constructor(options: BitcoinNetworkOptions) {
    const api = async () => {
      const api = new BitcoinAPI(options.node);
      await api.init();
      return api;
    };

    const baseOptions: BaseNetworkOptions = {
      identicon: createIcon,
      signer: [SignerType.sr25519, SignerType.ed25519],
      displayAddress: (address: string) => address,
      provider: ProviderName.polkadot,
      api,
      ...options,
    };
    super(baseOptions);
    this.activityHandler = options.activityHandler;
  }

  public getAllTokens(): Promise<BaseToken[]> {
    return Promise.resolve(this.assets);
  }

  public async getAllTokenInfo(address: string): Promise<AssetsType[]> {
    console.log("get all token info bitcoin", address);
    return [];
  }
  public getAllActivity(address: string): Promise<Activity[]> {
    return this.activityHandler(this, address);
  }
}
