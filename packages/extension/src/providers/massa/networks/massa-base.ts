import { NetworkNames } from '@enkryptcom/types';
import { BaseNetwork } from '@/types/base-network';
import MassaAPI from '../libs/api';
import { SignerType } from '@enkryptcom/types';
import { ProviderName } from '@/types/provider';
import { MassaNetworkOptions } from '../types';
import ActivityState from '@/libs/activity-state';
import { Activity } from '@/types/activity';
import { AssetsType } from '@/types/provider';
import { fromBase } from '@enkryptcom/utils';
import { formatFloatingPointValue } from '@/libs/utils/number-formatter';
import MarketData from '@/libs/market-data';
import BigNumber from 'bignumber.js';
import icon from './icons/Massa_logo.webp';
import createIcon from '../../ethereum/libs/blockies';

export class MassaNetwork extends BaseNetwork {
  chainId: bigint;

  constructor(options: MassaNetworkOptions) {
    super(options);
    this.chainId = options.chainId!;
  }

  async getAllTokens(): Promise<any[]> {
    return [];
  }

  async getAllTokenInfo(address: string): Promise<AssetsType[]> {
    try {
      // Get native MAS balance
      const api = (await this.api()) as MassaAPI;
      const balance = await api.getBalance(address);
      const balanceFormatted = fromBase(balance, this.decimals);
      const balanceDisplayFormatted =
        formatFloatingPointValue(balanceFormatted).value;

      // Get MAS price from CoinGecko
      let price = '0';
      let priceChangePercentage = 0;
      let sparklineData = '';

      try {
        if (this.coingeckoID) {
          const marketData = new MarketData();
          const tokenPrice = await marketData.getTokenPrice(this.coingeckoID);
          const marketInfos = await marketData.getMarketData([
            this.coingeckoID,
          ]);
          const marketInfo = marketInfos[0];

          if (tokenPrice) {
            price = tokenPrice;
          }

          if (marketInfo) {
            priceChangePercentage = marketInfo.price_change_percentage_24h || 0;
            if (marketInfo.sparkline_in_24h?.price) {
              // Convert sparkline data to string format expected by UI
              sparklineData = JSON.stringify(
                marketInfo.sparkline_in_24h.price.slice(-25),
              ); // Last 25 points
            }
          }
        }
      } catch (priceError) {
        // Price data not available, continue with default values
      }

      // Calculate USD values
      const balanceUSD = new BigNumber(balanceDisplayFormatted)
        .times(price)
        .toNumber();
      const balanceUSDf = new BigNumber(balanceDisplayFormatted)
        .times(price)
        .toString();
      const priceFormatted = formatFloatingPointValue(price).value;

      const nativeTokenAsset: AssetsType = {
        name: this.currencyNameLong,
        symbol: this.currencyName,
        icon: this.icon,
        balance: balanceFormatted,
        balancef: balanceDisplayFormatted,
        balanceUSD,
        balanceUSDf,
        value: price,
        valuef: priceFormatted,
        decimals: this.decimals,
        sparkline: sparklineData,
        priceChangePercentage,
        // No contract for native token
      };

      return [nativeTokenAsset];
    } catch (error) {
      return [];
    }
  }

  async getAllActivity(address: string): Promise<Activity[]> {
    try {
      const activityState = new ActivityState();
      const activities = await activityState.getAllActivities({
        address,
        network: this.name,
      });
      return activities;
    } catch (error) {
      return [];
    }
  }
}

// Helper function to create standard Massa network options
export function createMassaNetworkOptions(config: {
  name: NetworkNames;
  name_long: string;
  blockExplorerTX: string;
  blockExplorerAddr: string;
  isTestNetwork: boolean;
  node: string;
  chainId: bigint;
  coingeckoID?: string;
}): MassaNetworkOptions {
  return {
    name: config.name,
    name_long: config.name_long,
    homePage: 'https://massa.net/',
    blockExplorerTX: config.blockExplorerTX,
    blockExplorerAddr: config.blockExplorerAddr,
    isTestNetwork: config.isTestNetwork,
    currencyName: 'MAS',
    currencyNameLong: 'Massa',
    node: config.node,
    icon,
    decimals: 9,
    signer: [SignerType.ed25519mas],
    displayAddress: (address: string) => address,
    provider: ProviderName.massa,
    identicon: createIcon,
    basePath: "m/44'/632'",
    chainId: config.chainId,
    coingeckoID: config.coingeckoID,
    api: async () => {
      const api = new MassaAPI(config.node);
      await api.init();
      return api;
    },
  };
}
