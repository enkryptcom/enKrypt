import { BaseNetwork, BaseNetworkOptions } from "@/types/base-network";
import SubstrateAPI from "@/providers/polkadot/libs/api";
import { AssetsType } from "@/types/provider";
import { BaseToken } from "@/types/base-token";
import { ProviderName } from "@/types/provider";
import { CoingeckoPlatform, NetworkNames, SignerType } from "@enkryptcom/types";
import { polkadotEncodeAddress, fromBase } from "@enkryptcom/utils";
import createIcon from "../libs/blockies";
import MarketData from "@/libs/market-data";
import BigNumber from "bignumber.js";
import {
  formatFiatValue,
  formatFloatingPointValue,
} from "@/libs/utils/number-formatter";
import Sparkline from "@/libs/sparkline";
import { SubstrateNativeToken } from "./substrate-native-token";
import { Activity } from "@/types/activity";
import { getApi, addNewApi } from "../libs/api-promises";
import { KnownTokenDisplay } from ".";
import { BN } from "ethereumjs-util";

export interface SubstrateNetworkOptions {
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
  gradient: string;
  node: string;
  coingeckoID?: string;
  coingeckoPlatform?: CoingeckoPlatform;
  genesisHash: string;
  knownTokens?: KnownTokenDisplay[];
  existentialDeposit?: BN;
  activityHandler: (
    network: BaseNetwork,
    address: string
  ) => Promise<Activity[]>;
  assetHandler?: (
    network: SubstrateNetwork,
    address: string | null,
    knownTokens?: KnownTokenDisplay[]
  ) => Promise<BaseToken[]>;
}

export class SubstrateNetwork extends BaseNetwork {
  public prefix: number;
  public assets: BaseToken[] = [];
  public genesisHash: string;
  public existentialDeposit?: BN;

  private knownTokens?: KnownTokenDisplay[];
  private activityHandler: (
    network: BaseNetwork,
    address: string
  ) => Promise<Activity[]>;
  private assetHandler?: (
    network: SubstrateNetwork,
    address: string | null,
    knownTokens?: KnownTokenDisplay[]
  ) => Promise<BaseToken[]>;

  constructor(options: SubstrateNetworkOptions) {
    const api = async () => {
      if (getApi(options.node)) return getApi(options.node);
      const api = new SubstrateAPI(options.node, {
        decimals: options.decimals,
        name: options.name,
      });
      await api.init();
      addNewApi(options.node, api);
      return api;
    };

    const baseOptions: BaseNetworkOptions = {
      basePath: "//",
      identicon: createIcon,
      signer: [SignerType.sr25519, SignerType.ed25519],
      displayAddress: (address: string) =>
        polkadotEncodeAddress(address, options.prefix),
      provider: ProviderName.polkadot,
      api,
      ...options,
    };
    super(baseOptions);
    this.prefix = options.prefix;
    this.genesisHash = options.genesisHash;

    this.activityHandler = options.activityHandler;
    this.assetHandler = options.assetHandler;
    this.knownTokens = options.knownTokens;
    this.existentialDeposit = options.existentialDeposit;
  }

  public getAllTokens(address?: string): Promise<BaseToken[]> {
    if (this.assetHandler) {
      return this.assetHandler(this, address ?? null, this.knownTokens);
    } else if (this.assets.length > 0) {
      return Promise.resolve(this.assets);
    } else {
      const nativeToken = new SubstrateNativeToken({
        name: this.currencyNameLong,
        symbol: this.name,
        coingeckoID: this.coingeckoID,
        decimals: this.decimals,
        icon: this.icon,
        existentialDeposit: this.existentialDeposit,
      });

      return Promise.resolve([nativeToken]);
    }
  }

  public async getAllTokenInfo(address: string): Promise<AssetsType[]> {
    let supported = this.assetHandler
      ? await this.assetHandler(this, address, this.knownTokens)
      : this.assets;

    if (supported.length === 0) {
      const nativeToken = new SubstrateNativeToken({
        name: this.currencyNameLong,
        symbol: this.name,
        coingeckoID: this.coingeckoID,
        decimals: this.decimals,
        icon: this.icon,
      });

      supported = [nativeToken];
    }

    const api = await this.api();

    const balancePromises = supported.map((token) => {
      if (!token.balance) {
        return token.getLatestUserBalance((api as SubstrateAPI).api, address);
      }

      return Promise.resolve(token.balance);
    });
    const marketData = new MarketData();
    const market = await marketData.getMarketData(
      supported.map(({ coingeckoID }) => coingeckoID ?? "")
    );

    const balances = (await Promise.all(
      balancePromises
    )) as unknown as number[];

    const tokens: AssetsType[] = supported.map((st, idx) => {
      const userBalance = fromBase(balances[idx].toString(), st.decimals);
      const usdBalance = new BigNumber(userBalance).times(
        market[idx]?.current_price || 0
      );
      return {
        balance: balances[idx].toString(),
        balancef: formatFloatingPointValue(userBalance).value,
        balanceUSD: usdBalance.toNumber(),
        balanceUSDf: formatFiatValue(usdBalance.toString()).value,
        decimals: st.decimals,
        icon: st.icon,
        name: st.name,
        symbol: st.symbol,
        priceChangePercentage:
          market[idx]?.price_change_percentage_7d_in_currency || 0,
        sparkline: market[idx]
          ? new Sparkline(market[idx]?.sparkline_in_7d.price, 25).dataValues
          : "",
        value: market[idx]?.current_price.toString() || "0",
        valuef: formatFloatingPointValue(
          market[idx]?.current_price.toString() || "0"
        ).value,
        baseToken: st,
      };
    });
    const nonNativNonZeroList = tokens.filter(
      (asset, idx) => idx !== 0 && asset.balance !== "0"
    );
    nonNativNonZeroList.sort((a, b) => {
      if (a.balanceUSD < b.balanceUSD) return 1;
      else if (a.balanceUSD > b.balanceUSD) return -1;
      else return 0;
    });
    nonNativNonZeroList.unshift(tokens[0]);
    return nonNativNonZeroList;
  }
  public getAllActivity(address: string): Promise<Activity[]> {
    return this.activityHandler(this, address);
  }
}
