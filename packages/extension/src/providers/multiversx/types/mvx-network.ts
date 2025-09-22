import MarketData from '@/libs/market-data';
import { CoinGeckoTokenMarket } from '@/libs/market-data/types';
import Sparkline from '@/libs/sparkline';
import { formatFloatingPointValue } from '@/libs/utils/number-formatter';
import createIcon from '@/providers/ethereum/libs/blockies';
import { Activity } from '@/types/activity';
import { BaseNetwork, BaseNetworkOptions } from '@/types/base-network';
import { BaseToken } from '@/types/base-token';
import { NFTCollection } from '@/types/nft';
import { AssetsType, ProviderName } from '@/types/provider';
import { CoingeckoPlatform, NetworkNames, SignerType } from '@enkryptcom/types';
import { fromBase, numberToHex } from '@enkryptcom/utils';
import { Address, ApiNetworkProvider } from '@multiversx/sdk-core';
import BigNumber from 'bignumber.js';
import API from '../libs/api';
import { MVXToken, MvxTokenOptions } from './mvx-token';

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
  buyLink: string | undefined;
  activityHandler: (
    network: BaseNetwork,
    address: string,
  ) => Promise<Activity[]>;
  isAddress: (address: string) => boolean;
  NFTHandler?: (
    network: BaseNetwork,
    address: string,
  ) => Promise<NFTCollection[]>;
  assetsInfoHandler?: (
    network: BaseNetwork,
    address: string,
  ) => Promise<AssetsType[]>;
}

export const isValidAddress = (address: string) => {
  try {
    Address.newFromBech32(address);
    return true;
  } catch {
    return false;
  }
};

export const getAddress = (pubkey: string) => {
  return new Address(pubkey).toBech32();
};

export class MultiversXNetwork extends BaseNetwork {
  public options: MultiversXNetworkOptions;

  private activityHandler: (
    network: BaseNetwork,
    address: string,
  ) => Promise<Activity[]>;

  assetsInfoHandler?: (
    network: BaseNetwork,
    address: string,
  ) => Promise<AssetsType[]>;

  NFTHandler?: (
    network: BaseNetwork,
    address: string,
  ) => Promise<NFTCollection[]>;

  isAddress: (address: string) => boolean;

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
    this.options = options;
    this.activityHandler = options.activityHandler;
    this.isAddress = options.isAddress;
    this.assetsInfoHandler = options.assetsInfoHandler;
    this.NFTHandler = options.NFTHandler;
  }

  public async getAllTokens(pubkey: string): Promise<BaseToken[]> {
    const native = await this.getNativeTokenInfo(pubkey);
    const assets = [
      new MVXToken({
        decimals: native.decimals,
        icon: native.icon,
        name: native.name,
        symbol: native.symbol,
        balance: native.balance,
        price: native.value,
        coingeckoID: this.coingeckoID,
        type: 'native',
      }),
    ];

    const fungibleTokens = await this.getFungibleTokens(pubkey);
    fungibleTokens.map(token => {
      const bTokenOptions: MvxTokenOptions = {
        decimals: token.decimals,
        icon: token.assets.pngUrl ? token.assets.pngUrl : '',
        name: token.name,
        symbol: token.identifier,
        balance: token.balance,
        price: new BigNumber(token.price).toString(),
        coingeckoID: '',
        type: token.type,
      };
      assets.push(new MVXToken(bTokenOptions));
    });

    const nonFungibleTokens = await this.getNonFungibleTokens(pubkey);
    nonFungibleTokens.map(token => {
      const icon = token.media?.[0]?.thumbnailUrl
        ? token.media[0].thumbnailUrl
        : '';
      const bTokenOptions: MvxTokenOptions = {
        decimals: token?.decimals ?? 0,
        icon: icon,
        name: token.name,
        symbol: token.identifier,
        balance: token.balance,
        coingeckoID: '',
        type: token.type,
      };
      assets.push(new MVXToken(bTokenOptions));
    });

    return assets;
  }

  public async getAllTokenInfo(pubkey: string): Promise<AssetsType[]> {
    const assets: AssetsType[] = [];
    assets.push(await this.getNativeTokenInfo(pubkey));

    const fungibleTokens = await this.getFungibleTokens(pubkey);
    fungibleTokens.map(token => {
      const balance = numberToHex(new BigNumber(token.balance).toFixed());
      const userBalance = fromBase(balance, token.decimals);

      const asset: AssetsType = {
        balance: balance,
        balancef: formatFloatingPointValue(userBalance).value,
        balanceUSD: token.valueUsd.toNumber(),
        balanceUSDf: token.valueUsd.toString(),
        icon: token.assets.pngUrl ? token.assets.pngUrl : '',
        name: token.name,
        symbol: token.identifier,
        value: token.price.toString(),
        valuef: token.price.toString(),
        decimals: token.decimals,
        sparkline: new Sparkline([], 25).dataValues,
        priceChangePercentage: 0,
      };
      assets.push(asset);
    });

    const nonFungibleTokens = await this.getNonFungibleTokens(pubkey);
    nonFungibleTokens.map(token => {
      const icon = token.media?.[0]?.thumbnailUrl
        ? token.media[0].thumbnailUrl
        : '';
      const asset: AssetsType = {
        balance: token.balance,
        balancef: formatFloatingPointValue(token.balance).value,
        balanceUSD: 0,
        balanceUSDf: '',
        icon: icon,
        name: token.name,
        symbol: token.identifier,
        value: '',
        valuef: '',
        decimals: token?.decimals ?? 0,
        sparkline: '',
        priceChangePercentage: 0,
      };
      assets.push(asset);
    });

    return assets;
  }

  private async getNativeTokenInfo(pubkey: string): Promise<AssetsType> {
    const balance = await (await this.api()).getBalance(pubkey);

    let marketData: (CoinGeckoTokenMarket | null)[] = [];
    if (this.coingeckoID) {
      const market = new MarketData();
      marketData = await market.getMarketData([this.coingeckoID]);
    }

    const currentPrice = marketData.length
      ? marketData[0]!.current_price || 0
      : 0;
    const userBalance = fromBase(balance, this.decimals);
    const usdBalance = new BigNumber(userBalance).times(currentPrice);
    const nativeAsset: AssetsType = {
      balance: balance,
      balancef: formatFloatingPointValue(userBalance).value,
      balanceUSD: usdBalance.toNumber(),
      balanceUSDf: usdBalance.toString(),
      icon: this.icon,
      name: this.name_long,
      symbol: this.currencyName,
      value: marketData.length ? currentPrice.toString() : '0',
      valuef: marketData.length ? currentPrice.toString() : '0',
      decimals: this.decimals,
      sparkline: marketData.length
        ? new Sparkline(marketData[0]!.sparkline_in_24h.price, 25).dataValues
        : '',
      priceChangePercentage: marketData.length
        ? marketData[0]!.price_change_percentage_24h_in_currency
        : 0,
    };
    return nativeAsset;
  }

  private async getFungibleTokens(pubkey: string): Promise<any[]> {
    const address = Address.newFromBech32(pubkey);
    const api = new ApiNetworkProvider(this.options.node);

    return await api.doGetGeneric(
      `accounts/${address.toBech32()}/tokens?from=0&size=10000`,
    );
  }

  private async getNonFungibleTokens(pubkey: string): Promise<any[]> {
    const address = Address.newFromBech32(pubkey);
    const api = new ApiNetworkProvider(this.options.node);

    return await api.doGetGeneric(
      `accounts/${address.toBech32()}/nfts?from=0&size=10000`,
    );
  }

  public getAllActivity(address: string): Promise<Activity[]> {
    return this.activityHandler(this, address);
  }
}
