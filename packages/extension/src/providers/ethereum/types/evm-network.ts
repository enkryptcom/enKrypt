import { formatFloatingPointValue } from "@/libs/utils/number-formatter";
import { fromBase } from "@/libs/utils/units";
import { Activity } from "@/types/activity";
import { BaseNetwork } from "@/types/base-network";
import { BaseToken } from "@/types/base-token";
import { NFTCollection } from "@/types/nft";
import { AssetsType, ProviderName } from "@/types/provider";
import { NetworkNames, SignerType } from "@enkryptcom/types";
import { toChecksumAddress } from "ethereumjs-util";
import API from "../libs/api";
import createIcon from "../libs/blockies";
import { NATIVE_TOKEN_ADDRESS } from "../libs/common";
import { Erc20Token, Erc20TokenOptions } from "./erc20-token";

export interface EvmNetworkOptions {
  name: NetworkNames;
  name_long: string;
  homePage: string;
  blockExplorerTX: string;
  blockExplorerAddr: string;
  chainID: number;
  isTestNetwork: boolean;
  currencyName: string;
  node: string;
  icon: string;
  gradient: string;
  coingeckoID?: string;
  basePath?: string;
  NFTHandler?: (
    network: BaseNetwork,
    address: string
  ) => Promise<NFTCollection[]>;
  assetsInfoHandler?: (
    network: BaseNetwork,
    address: string
  ) => Promise<AssetsType[]>;
  activityHandler: (
    network: BaseNetwork,
    address: string
  ) => Promise<Activity[]>;
}

export class EvmNetwork extends BaseNetwork {
  public chainID: number;

  private assetsInfoHandler?: (
    network: BaseNetwork,
    address: string
  ) => Promise<AssetsType[]>;

  NFTHandler?: (
    network: BaseNetwork,
    address: string
  ) => Promise<NFTCollection[]>;

  private activityHandler: (
    network: BaseNetwork,
    address: string
  ) => Promise<Activity[]>;

  public assets: Erc20Token[] = [];

  constructor(options: EvmNetworkOptions) {
    const api = async () => {
      const api = new API(options.node);
      await api.init();
      return api;
    };

    const baseOptions = {
      signer: [SignerType.secp256k1],
      provider: ProviderName.ethereum,
      displayAddress: (address: string) => toChecksumAddress(address),
      identicon: createIcon,
      basePath: options.basePath ? options.basePath : "m/44'/60'/0'/0",
      decimals: 18,
      api,
      ...options,
    };

    super(baseOptions);

    this.chainID = options.chainID;
    this.assetsInfoHandler = options.assetsInfoHandler;
    this.NFTHandler = options.NFTHandler;
    this.activityHandler = options.activityHandler;
  }

  public async getAllTokens(address: string): Promise<BaseToken[]> {
    const assets = await this.getAllTokenInfo(address);
    return assets.map((token) => {
      const bTokenOptions: Erc20TokenOptions = {
        decimals: token.decimals,
        icon: token.icon,
        name: token.name,
        symbol: token.symbol,
        balance: token.balance,
        price: token.value,
        contract: token.contract!,
      };
      return new Erc20Token(bTokenOptions);
    });
  }

  public async getAllTokenInfo(address: string): Promise<AssetsType[]> {
    if (this.assetsInfoHandler) {
      return this.assetsInfoHandler(this, address);
    } else {
      const api = await this.api();
      const balance = await (api as API).getBalance(address);
      const nativeAsset: AssetsType = {
        name: this.name_long,
        symbol: this.name,
        icon: this.icon,
        balance,
        balancef: formatFloatingPointValue(fromBase(balance, this.decimals))
          .value,
        balanceUSD: 0,
        balanceUSDf: "0",
        value: "0",
        valuef: "0",
        decimals: this.decimals,
        sparkline: "",
        priceChangePercentage: 0,
        contract: NATIVE_TOKEN_ADDRESS,
      };

      await Promise.all(
        this.assets.map((token) =>
          token.getLatestUserBalance(api as API, address).then((balance) => {
            token.balance = balance;
          })
        )
      );

      const assetInfos = this.assets
        .map((token) => {
          const assetsType: AssetsType = {
            name: token.name,
            symbol: token.symbol,
            icon: token.icon,
            balance,
            balancef: formatFloatingPointValue(
              fromBase(token.balance!, token.decimals)
            ).value,
            balanceUSD: 0,
            balanceUSDf: "0",
            value: "0",
            valuef: "0",
            decimals: token.decimals,
            sparkline: "",
            priceChangePercentage: 0,
            contract: token.contract,
          };

          return assetsType;
        })
        .filter((asset) => asset.balancef !== "0");

      return [nativeAsset, ...assetInfos];
    }
  }
  public getAllActivity(address: string): Promise<Activity[]> {
    return this.activityHandler(this, address);
  }
}
