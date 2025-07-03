import MarketData from '@/libs/market-data';
import { CoinGeckoTokenMarket } from '@/libs/market-data/types';
import Sparkline from '@/libs/sparkline';
import { formatFloatingPointValue } from '@/libs/utils/number-formatter';
import createIcon from '@/providers/ethereum/libs/blockies';
import { Activity } from '@/types/activity';
import { BaseNetwork, BaseNetworkOptions } from '@/types/base-network';
import { BaseToken, BaseTokenOptions } from '@/types/base-token';
import { AssetsType, ProviderName } from '@/types/provider';
import { CoingeckoPlatform, NetworkNames, SignerType } from '@enkryptcom/types';
import { fromBase } from '@enkryptcom/utils';
import { Address } from '@multiversx/sdk-core';
import BigNumber from 'bignumber.js';
import API from '../libs/api';
import { MVXToken } from './mvx-token';

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
  activityHandler: (
    network: BaseNetwork,
    address: string,
  ) => Promise<Activity[]>;
}

export const getAddress = (pubkey: string) => {
  return new Address(pubkey).toBech32();
};

export class MultiversXNetwork extends BaseNetwork {
  private activityHandler: (
    network: BaseNetwork,
    address: string,
  ) => Promise<Activity[]>;

  assetsInfoHandler?: (
    network: BaseNetwork,
    address: string,
  ) => Promise<AssetsType[]>;
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
    this.activityHandler = options.activityHandler;
  }

  public async getAllTokens(pubkey: string): Promise<BaseToken[]> {
    const assets = await this.getAllTokenInfo(pubkey);
    return assets.map(token => {
      const bTokenOptions: BaseTokenOptions = {
        decimals: token.decimals,
        icon: token.icon,
        name: token.name,
        symbol: token.symbol,
        balance: token.balance,
        price: token.value,
        coingeckoID: this.coingeckoID,
      };
      return new MVXToken(bTokenOptions);
    });
  }

  public async getAllTokenInfo(pubkey: string): Promise<AssetsType[]> {
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
      contract: '',
      decimals: this.decimals,
      sparkline: marketData.length
        ? new Sparkline(marketData[0]!.sparkline_in_24h.price, 25).dataValues
        : '',
      priceChangePercentage: marketData.length
        ? marketData[0]!.price_change_percentage_24h_in_currency
        : 0,
    };
    return [nativeAsset];
  }

  public getAllActivity(address: string): Promise<Activity[]> {
    return this.activityHandler(this, address);
  }
}
