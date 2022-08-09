import { BaseNetwork, BaseNetworkOptions } from "@/types/base-network";
import BitcoinAPI from "@/providers/bitcoin/libs/api";
import { AssetsType } from "@/types/provider";
import { BaseToken } from "@/types/base-token";
import { ProviderName } from "@/types/provider";
import { NetworkNames, SignerType } from "@enkryptcom/types";
import createIcon from "../libs/blockies";
import { Activity } from "@/types/activity";
import { BitcoinNetworkInfo } from ".";
import { payments } from "bitcoinjs-lib";
import { hexToBuffer } from "@enkryptcom/utils";

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
  networkInfo: BitcoinNetworkInfo;
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
      signer: [SignerType.secp256k1btc],
      provider: ProviderName.bitcoin,
      displayAddress: (pubkey: string) => {
        const { address } = payments.p2wpkh({
          pubkey: hexToBuffer(pubkey),
          network: options.networkInfo,
        });
        return address as string;
      },
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
