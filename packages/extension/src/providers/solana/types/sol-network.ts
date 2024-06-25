import { BaseNetwork, BaseNetworkOptions } from "@/types/base-network";
import BitcoinAPI from "@/providers/bitcoin/libs/api";
import { AssetsType } from "@/types/provider";
import { BaseToken, BaseTokenOptions } from "@/types/base-token";
import { ProviderName } from "@/types/provider";
import { NetworkNames, SignerType } from "@enkryptcom/types";
import createIcon from "../libs/blockies";
import { Activity } from "@/types/activity";
import {
  formatFiatValue,
  formatFloatingPointValue,
} from "@/libs/utils/number-formatter";
import MarketData from "@/libs/market-data";
import BigNumber from "bignumber.js";
import { CoinGeckoTokenMarket } from "@/libs/market-data/types";
import Sparkline from "@/libs/sparkline";
import { SOLToken } from "./sol-token";
import { NFTCollection } from "@/types/nft";
import { fromBase } from "@enkryptcom/utils";

export interface SolanaNetworkOptions {
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
  basePath: string;
  dust: number;
  NFTHandler?: (
    network: BaseNetwork,
    address: string
  ) => Promise<NFTCollection[]>;
  activityHandler: (
    network: BaseNetwork,
    address: string
  ) => Promise<Activity[]>;
}

export const getAddress = (pubkey: string) => {
  return pubkey as string;
};
export class BitcoinNetwork extends BaseNetwork {
  public assets: BaseToken[] = [];
  private activityHandler: (
    network: BaseNetwork,
    address: string
  ) => Promise<Activity[]>;
  NFTHandler?: (
    network: BaseNetwork,
    address: string
  ) => Promise<NFTCollection[]>;
  constructor(options: SolanaNetworkOptions) {
    const api = async () => {
      const api = new Api(options.node);
      await api.init();
      return api as BitcoinAPI;
    };

    const baseOptions: BaseNetworkOptions = {
      identicon: createIcon,
      signer: [SignerType.secp256k1btc],
      provider: ProviderName.bitcoin,
      displayAddress: (pubkey: string) => getAddress(pubkey),
      api,
      ...options,
    };
    super(baseOptions);
    this.activityHandler = options.activityHandler;
    this.NFTHandler = options.NFTHandler;
  }

  public async getAllTokens(pubkey: string): Promise<BaseToken[]> {
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
      return new SOLToken(bTokenOptions);
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
