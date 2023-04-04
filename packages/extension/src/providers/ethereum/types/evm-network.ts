import MarketData from "@/libs/market-data";
import Sparkline from "@/libs/sparkline";
import { TokensState } from "@/libs/tokens-state";
import { CustomErc20Token, TokenType } from "@/libs/tokens-state/types";
import {
  formatFiatValue,
  formatFloatingPointValue,
} from "@/libs/utils/number-formatter";
import { fromBase } from "@enkryptcom/utils";
import { Activity } from "@/types/activity";
import { BaseNetwork } from "@/types/base-network";
import { BaseToken } from "@/types/base-token";
import { NFTCollection } from "@/types/nft";
import { AssetsType, ProviderName } from "@/types/provider";
import { CoingeckoPlatform, NetworkNames, SignerType } from "@enkryptcom/types";
import BigNumber from "bignumber.js";
import { BNLike, toChecksumAddress } from "ethereumjs-util";
import { isAddress } from "web3-utils";
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
  chainID: `0x${string}`;
  isTestNetwork: boolean;
  currencyName: string;
  currencyNameLong: string;
  node: string;
  icon: string;
  gradient: string;
  coingeckoID?: string;
  coingeckoPlatform?: CoingeckoPlatform;
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
  customTokens?: boolean;
  displayAddress?: (address: string, chainId?: BNLike) => string;
  isAddress?: (address: string, chainId?: BNLike) => boolean;
}

export class EvmNetwork extends BaseNetwork {
  public chainID: `0x${string}`;

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

  public isAddress: (address: string, chainId?: BNLike) => boolean;

  constructor(options: EvmNetworkOptions) {
    const api = async () => {
      const api = new API(options.node);
      await api.init();
      return api;
    };

    const baseOptions = {
      signer: [SignerType.secp256k1],
      provider: ProviderName.ethereum,
      displayAddress: options.displayAddress
        ? options.displayAddress
        : (address: string) => toChecksumAddress(address),
      identicon: createIcon,
      basePath: options.basePath ? options.basePath : "m/44'/60'/0'/0",
      decimals: 18,
      api,
      ...options,
    };

    baseOptions.customTokens = baseOptions.customTokens ?? true;
    super(baseOptions);

    this.chainID = options.chainID;
    this.assetsInfoHandler = options.assetsInfoHandler;
    this.NFTHandler = options.NFTHandler;
    this.activityHandler = options.activityHandler;
    this.isAddress = options.isAddress
      ? options.isAddress
      : (address: string) => isAddress(address);
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
    const api = await this.api();
    const tokensState = new TokensState();
    const marketData = new MarketData();

    let assets: AssetsType[] = [];

    if (this.assetsInfoHandler) {
      assets = await this.assetsInfoHandler(this, address);
    } else {
      const balance = await (api as API).getBalance(address);
      const nativeMarketData = (
        await marketData.getMarketData([this.coingeckoID!])
      )[0];
      const nativeUsdBalance = new BigNumber(
        fromBase(balance, this.decimals)
      ).times(nativeMarketData?.current_price ?? 0);
      const nativeAsset: AssetsType = {
        name: this.currencyNameLong,
        symbol: this.currencyName,
        icon: this.icon,
        balance,
        balancef: formatFloatingPointValue(fromBase(balance, this.decimals))
          .value,
        balanceUSD: nativeUsdBalance.toNumber(),
        balanceUSDf: formatFiatValue(nativeUsdBalance.toString()).value,
        value: nativeMarketData?.current_price.toString() ?? "0",
        valuef: formatFiatValue(
          nativeMarketData?.current_price.toString() ?? "0"
        ).value,
        decimals: this.decimals,
        sparkline: nativeMarketData
          ? new Sparkline(nativeMarketData.sparkline_in_7d.price, 25).dataValues
          : "",
        priceChangePercentage:
          nativeMarketData?.price_change_percentage_7d_in_currency ?? 0,
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
            balance: token.balance!,
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

      assets = [nativeAsset, ...assetInfos];
    }

    const customTokens = await tokensState
      .getTokensByNetwork(this.name)
      .then((tokens) => {
        const erc20Tokens = tokens.filter((token) => {
          if (token.type !== TokenType.ERC20) {
            return false;
          }

          for (const a of assets) {
            if (
              a.contract &&
              (token as CustomErc20Token).address &&
              a.contract.toLowerCase() ===
                (token as CustomErc20Token).address.toLowerCase()
            ) {
              return false;
            }
          }

          return true;
        }) as CustomErc20Token[];

        return erc20Tokens.map(({ name, symbol, address, icon, decimals }) => {
          return new Erc20Token({
            name,
            symbol,
            contract: address,
            icon,
            decimals,
          });
        });
      });

    const balancePromises = customTokens.map((token) =>
      token.getLatestUserBalance(api as API, address)
    );

    await Promise.all(balancePromises);

    const marketInfos = await marketData.getMarketInfoByContracts(
      customTokens.map((token) => token.contract.toLowerCase()),
      this.coingeckoPlatform!
    );

    const customAssets: AssetsType[] = customTokens.map((token) => {
      const asset: AssetsType = {
        name: token.name,
        symbol: token.symbol,
        balance: token.balance ?? "0",
        balancef: formatFloatingPointValue(
          fromBase(token.balance ?? "0", token.decimals)
        ).value,
        contract: token.contract,
        balanceUSD: 0,
        balanceUSDf: "0",
        value: "0",
        valuef: "0",
        decimals: token.decimals,
        sparkline: "",
        priceChangePercentage: 0,
        icon: token.icon,
      };

      const marketInfo = marketInfos[token.contract.toLowerCase()];

      if (marketInfo) {
        const usdBalance = new BigNumber(
          fromBase(token.balance ?? "0", token.decimals)
        ).times(marketInfo.current_price);
        asset.balanceUSD = usdBalance.toNumber();
        asset.balanceUSDf = formatFiatValue(usdBalance.toString()).value;
        asset.value = marketInfo.current_price.toString();
        asset.valuef = formatFiatValue(
          marketInfo.current_price.toString()
        ).value;
        asset.sparkline = new Sparkline(
          marketInfo.sparkline_in_7d.price,
          25
        ).dataValues;
        asset.priceChangePercentage =
          marketInfo.price_change_percentage_7d_in_currency || 0;
      }

      return asset;
    });

    return [...assets, ...customAssets];
  }
  public getAllActivity(address: string): Promise<Activity[]> {
    return this.activityHandler(this, address);
  }
}
