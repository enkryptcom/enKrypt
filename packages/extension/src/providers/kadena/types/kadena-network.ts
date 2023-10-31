import { Activity } from "@/types/activity";
import { BaseNetwork, BaseNetworkOptions } from "@/types/base-network";
import { BaseTokenOptions } from "@/types/base-token";
import { AssetsType, ProviderName } from "@/types/provider";
import { CoingeckoPlatform, NetworkNames, SignerType } from "@enkryptcom/types";
import KadenaAPI from "@/providers/kadena/libs/api";

import createIcon from "../libs/blockies";
import MarketData from "@/libs/market-data";
import { CoinGeckoTokenMarket } from "@/libs/market-data/types";
import Sparkline from "@/libs/sparkline";
import {
  formatFloatingPointValue,
  formatFiatValue,
} from "@/libs/utils/number-formatter";
import { fromBase } from "@enkryptcom/utils";
import BigNumber from "bignumber.js";
import { KDABaseToken, KDAToken } from "./kda-token";
import { KadenaApiOptions } from ".";

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
  kadenaApiOptions: KadenaApiOptions;
  displayAddress: (address: string) => string;
  coingeckoID?: string;
  coingeckoPlatform?: CoingeckoPlatform;
  activityHandler: (
    network: BaseNetwork,
    address: string
  ) => Promise<Activity[]>;
}

export class KadenaNetwork extends BaseNetwork {
  public options: KadenaNetworkOptions;

  private activityHandler: (
    network: BaseNetwork,
    address: string
  ) => Promise<Activity[]>;

  constructor(options: KadenaNetworkOptions) {
    const api = async () => {
      const api = new KadenaAPI(options.node, options);
      return api;
    };

    const baseOptions: BaseNetworkOptions = {
      basePath: "m/44'/626'",
      identicon: createIcon,
      signer: [SignerType.ed25519kda],
      provider: ProviderName.kadena,
      api,
      importAccount: false,
      ...options,
    };

    super(baseOptions);
    this.options = options;
    this.activityHandler = options.activityHandler;
  }

  public async getAllTokens(pubkey: string): Promise<KDABaseToken[]> {
    const assets = await this.getAllTokenInfo(pubkey);

    return assets.map((token) => {
      const bTokenOptions: BaseTokenOptions = {
        decimals: token.decimals,
        icon: token.icon,
        name: token.name,
        symbol: token.symbol,
        balance: token.balance,
        price: token.value,
        coingeckoID: this.coingeckoID,
      };

      return new KDAToken(bTokenOptions);
    });
  }

  public async getAllTokenInfo(pubkey: string): Promise<AssetsType[]> {
    const balance = await (await this.api()).getBalance(pubkey);
    let marketData: (CoinGeckoTokenMarket | null)[] = [];

    if (this.coingeckoID) {
      const market = new MarketData();
      marketData = await market.getMarketData([this.coingeckoID]);
    }

    const userBalance = fromBase(balance, this.decimals);
    const usdBalance = new BigNumber(userBalance).times(
      marketData.length ? marketData[0]!.current_price : 0
    );

    const nativeAsset: AssetsType = {
      balance: balance,
      balancef: formatFloatingPointValue(userBalance).value,
      balanceUSD: usdBalance.toNumber(),
      balanceUSDf: formatFiatValue(usdBalance.toString()).value,
      icon: this.icon,
      name: this.name_long,
      symbol: this.currencyName,
      value: marketData.length ? marketData[0]!.current_price.toString() : "0",
      valuef: formatFiatValue(
        marketData.length ? marketData[0]!.current_price.toString() : "0"
      ).value,
      contract: "",
      decimals: this.decimals,
      sparkline: marketData.length
        ? new Sparkline(marketData[0]!.sparkline_in_7d.price, 25).dataValues
        : "",
      priceChangePercentage: marketData.length
        ? marketData[0]!.price_change_percentage_7d_in_currency
        : 0,
    };

    return [nativeAsset];
  }

  public getAllActivity(address: string): Promise<Activity[]> {
    return this.activityHandler(this, address);
  }
}
