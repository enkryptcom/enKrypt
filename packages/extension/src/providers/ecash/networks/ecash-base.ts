import { NetworkNames, SignerType } from '@enkryptcom/types';
import wrapActivityHandler from '@/libs/activity-state/wrap-activity-handler';
import { chronikHandler } from '../libs/activity-handlers';
import { ECashNetworkOptions, getAddress } from '../types/ecash-network';
import { ECashNetworkInfo } from '../types/ecash-chronik';
import { GasPriceTypes } from '@/providers/common/types';
import { BaseNetwork, BaseNetworkOptions } from '@/types/base-network';
import { AssetsType } from '@/types/provider';
import { BaseToken } from '@/types/base-token';
import { ECashToken } from '../types/ecash-token';
import { ProviderName } from '@/types/provider';
import { Activity } from '@/types/activity';
import { NFTCollection } from '@/types/nft';
import { ChronikAPI } from '../libs/api-chronik';
import { fromBase } from '@enkryptcom/utils';
import { formatFloatingPointValue } from '@/libs/utils/number-formatter';
import MarketData from '@/libs/market-data';
import BigNumber from 'bignumber.js';
import { CoinGeckoTokenMarket } from '@/libs/market-data/types';
import Sparkline from '@/libs/sparkline';
import createIcon from '../../bitcoin/libs/blockies';
import icon from './icons/ecash.svg';

const ecashNetworkInfo: ECashNetworkInfo = {
  messagePrefix: '\x18eCash Signed Message:\n',
  bech32: '',
  bip32: {
    public: 0x0488b21e,
    private: 0x0488ade4,
  },
  pubKeyHash: 0x00,
  scriptHash: 0x05,
  wif: 0x80,
  cashAddrPrefix: 'ecash',
};

export const createECashNetworkOptions = (
  options: Partial<ECashNetworkOptions>,
): ECashNetworkOptions => {
  return {
    name: options.name || NetworkNames.ECash,
    name_long: options.name_long || 'eCash',
    homePage: options.homePage || 'https://e.cash/',
    blockExplorerTX:
      options.blockExplorerTX || 'https://explorer.e.cash/tx/[[txHash]]',
    blockExplorerAddr:
      options.blockExplorerAddr ||
      'https://explorer.e.cash/address/[[address]]',
    isTestNetwork: options.isTestNetwork ?? false,
    currencyName: options.currencyName || 'XEC',
    currencyNameLong: options.currencyNameLong || 'eCash',
    icon: options.icon || icon,
    decimals: options.decimals ?? 2,
    node: options.node || 'https://chronik-native1.fabien.cash',
    coingeckoID: options.coingeckoID || 'ecash',
    networkInfo: options.networkInfo || ecashNetworkInfo,
    dust: options.dust ?? 546,
    feeHandler: options.feeHandler,
    activityHandler:
      options.activityHandler || wrapActivityHandler(chronikHandler),
    NFTHandler: options.NFTHandler,
    cashAddrPrefix: options.cashAddrPrefix || 'ecash',
  } as ECashNetworkOptions;
};

export class ECashNetwork extends BaseNetwork {
  public assets: BaseToken[] = [];
  public networkInfo: ECashNetworkInfo;
  public dust: number;
  private activityHandler: (
    network: BaseNetwork,
    address: string,
  ) => Promise<Activity[]>;
  feeHandler: () => Promise<Record<GasPriceTypes, number>>;
  NFTHandler?: (
    network: BaseNetwork,
    address: string,
  ) => Promise<NFTCollection[]>;
  public cashAddrPrefix: string;

  constructor(options: ECashNetworkOptions) {
    const api = async () => {
      const chronikApi = new ChronikAPI(
        options.node,
        options.networkInfo,
        options.decimals,
        options.name,
      );
      await chronikApi.init();
      return chronikApi as ChronikAPI;
    };

    const baseOptions: BaseNetworkOptions = {
      identicon: createIcon,
      signer: [SignerType.secp256k1ecash],
      provider: ProviderName.ecash,
      displayAddress: (pubkey: string) => getAddress(pubkey),
      api,
      basePath: `m/44'/1899'/0'/0`,
      ...options,
    };

    super(baseOptions);
    this.activityHandler = options.activityHandler;
    this.networkInfo = options.networkInfo;
    this.feeHandler = options.feeHandler;
    this.NFTHandler = options.NFTHandler;
    this.dust = options.dust;
    this.cashAddrPrefix =
      options.cashAddrPrefix || options.networkInfo.cashAddrPrefix;
  }

  public async getAllTokens(pubkey: string): Promise<BaseToken[]> {
    const assets: AssetsType[] = await this.getAllTokenInfo(pubkey);
    return assets.map(
      (token: AssetsType): BaseToken =>
        new ECashToken({
          name: token.name,
          symbol: token.symbol,
          icon: token.icon,
          balance: token.balance,
          decimals: token.decimals,
          price: token.value,
          coingeckoID: this.coingeckoID,
        }),
    );
  }

  public async getAllTokenInfo(pubkey: string): Promise<AssetsType[]> {
    try {
      const api: ChronikAPI = (await this.api()) as unknown as ChronikAPI;

      const balanceInSatoshis: string = await api.getBalance(pubkey);

      const userBalance: string = fromBase(balanceInSatoshis, this.decimals);

      let marketData: (CoinGeckoTokenMarket | null)[] = [];
      let currentPrice: number = 0;

      if (this.coingeckoID) {
        try {
          const market: MarketData = new MarketData();
          marketData = await market.getMarketData([this.coingeckoID]);
          currentPrice = marketData[0]?.current_price ?? 0;
        } catch (priceError) {
          console.error(
            '⚠️ [getAllTokenInfo] Error getting price, using 0:',
            priceError,
          );
          currentPrice = 0;
        }
      }

      const usdBalance: BigNumber = new BigNumber(userBalance).times(
        currentPrice,
      );

      const nativeAsset: AssetsType = {
        balance: balanceInSatoshis,
        balancef: formatFloatingPointValue(userBalance).value,
        balanceUSD: usdBalance.toNumber(),
        balanceUSDf: usdBalance.toFixed(2),
        icon: this.icon,
        name: this.name_long,
        symbol: this.currencyName,
        value: currentPrice.toString(),
        valuef:
          currentPrice < 0.01
            ? currentPrice.toFixed(8).replace(/\.?0+$/, '')
            : currentPrice.toFixed(2),
        contract: '',
        decimals: this.decimals,
        sparkline: marketData.length
          ? new Sparkline(marketData[0]!.sparkline_in_24h.price, 25).dataValues
          : '',
        priceChangePercentage: marketData.length
          ? marketData[0]!.price_change_percentage_24h_in_currency
          : 0,
      };

      const allAssets: AssetsType[] = [nativeAsset];

      return allAssets;
    } catch (error) {
      console.error('❌ [getAllTokenInfo] FATAL ERROR:', error);
      console.error('❌ [getAllTokenInfo] Stack:', (error as Error).stack);

      const fallbackAsset: AssetsType = {
        balance: '0',
        balancef: '0.00',
        balanceUSD: 0,
        balanceUSDf: '0.00',
        icon: this.icon,
        name: this.name_long,
        symbol: this.currencyName,
        value: '0',
        valuef: '0.00',
        contract: '',
        decimals: this.decimals,
        sparkline: '',
        priceChangePercentage: 0,
      };
      return [fallbackAsset];
    }
  }

  public getAllActivity(address: string): Promise<Activity[]> {
    return this.activityHandler(this, address);
  }
}

const ecashOptions = createECashNetworkOptions({
  name: NetworkNames.ECash,
  name_long: 'eCash',
  homePage: 'https://e.cash/',
  blockExplorerTX: 'https://explorer.e.cash/tx/[[txHash]]',
  blockExplorerAddr: 'https://explorer.e.cash/address/[[address]]',
  isTestNetwork: false,
  currencyName: 'XEC',
  currencyNameLong: 'eCash',
  coingeckoID: 'ecash',
  node: 'https://chronik-native1.fabien.cash',
  dust: 546,
});

const ecash = new ECashNetwork(ecashOptions);

export default ecash;
