/**
 * Animica (ANM) — proof-of-work L1 with post-quantum ML-DSA-65 (FIPS 204)
 * account signatures and Python-VM contracts. Mainnet since 2026-04.
 *
 * Resources
 *   Website:    https://animica.org
 *   Explorer:   https://explorer.animica.org
 *   RPC:        https://rpc.animica.org/rpc (JSON-RPC 2.0)
 *   Source:     https://github.com/animicaorg/all
 *   HD path:    m/44'/4279885'/account'/0'/index' (docs/wallet/HD_DERIVATION.md)
 *   Buy/trade:  https://nonkyc.io/market/ANM_USDT
 */
import { NetworkNames, SignerType } from '@enkryptcom/types';
import { BaseNetwork } from '@/types/base-network';
import AnimicaAPI from '../libs/api';
import { AssetsType, ProviderName } from '@/types/provider';
import { AnimicaNetworkOptions } from '../types';
import { Activity } from '@/types/activity';
import { fromBase } from '@enkryptcom/utils';
import { formatFloatingPointValue } from '@/libs/utils/number-formatter';
import MarketData from '@/libs/market-data';
import BigNumber from 'bignumber.js';
import icon from './icons/animica.svg';
import createIcon from '../../ethereum/libs/blockies';
import { BaseToken } from '@/types/base-token';
import { AnimicaActivity } from '../libs/activity-handlers';
import wrapActivityHandler from '@/libs/activity-state/wrap-activity-handler';
import { isValidAddress } from '../libs/address';

export class AnimicaNetwork extends BaseNetwork {
  chainId: number;
  genesisHash: string;
  forkId: number;
  explorerApi: string;
  private activityHandler?: (
    network: BaseNetwork,
    address: string,
  ) => Promise<Activity[]>;

  constructor(options: AnimicaNetworkOptions) {
    super(options);
    this.chainId = options.chainId;
    this.genesisHash = options.genesisHash;
    this.forkId = options.forkId;
    this.explorerApi = options.explorerApi;
    this.activityHandler =
      options.activityHandler || wrapActivityHandler(AnimicaActivity);
  }

  async getAllTokens(): Promise<BaseToken[]> {
    return [];
  }

  async getAllTokenInfo(address: string): Promise<AssetsType[]> {
    try {
      const api = (await this.api()) as AnimicaAPI;
      const balance = await api.getBalance(address);
      const balanceFormatted = fromBase(balance, this.decimals);
      const balanceDisplayFormatted =
        formatFloatingPointValue(balanceFormatted).value;

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
              sparklineData = JSON.stringify(
                marketInfo.sparkline_in_24h.price.slice(-25),
              );
            }
          }
        }
      } catch {
        // Price data not available, continue with default values
      }

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
        balance,
        balancef: balanceDisplayFormatted,
        balanceUSD,
        balanceUSDf,
        value: price,
        valuef: priceFormatted,
        decimals: this.decimals,
        sparkline: sparklineData,
        priceChangePercentage,
      };

      return [nativeTokenAsset];
    } catch {
      return [];
    }
  }

  async getAllActivity(address: string): Promise<Activity[]> {
    if (this.activityHandler) {
      return this.activityHandler(this, address);
    }
    return [];
  }

  isValidAddress = (address: string): boolean => isValidAddress(address);
}

// Helper function to create standard Animica network options
export function createAnimicaNetworkOptions(config: {
  name: NetworkNames;
  name_long: string;
  blockExplorerTX: string;
  blockExplorerAddr: string;
  isTestNetwork: boolean;
  node: string;
  explorerApi: string;
  chainId: number;
  genesisHash: string;
  forkId: number;
  coingeckoID?: string;
}): AnimicaNetworkOptions {
  return {
    name: config.name,
    name_long: config.name_long,
    homePage: 'https://animica.org/',
    blockExplorerTX: config.blockExplorerTX,
    blockExplorerAddr: config.blockExplorerAddr,
    isTestNetwork: config.isTestNetwork,
    currencyName: 'ANM',
    currencyNameLong: 'Animica',
    node: config.node,
    icon,
    decimals: 9,
    signer: [SignerType.mldsa65anm],
    displayAddress: (address: string) => address,
    provider: ProviderName.animica,
    identicon: createIcon,
    basePath: "m/44'/4279885'",
    chainId: config.chainId,
    genesisHash: config.genesisHash,
    forkId: config.forkId,
    explorerApi: config.explorerApi,
    coingeckoID: config.coingeckoID,
    customTokens: false,
    api: async () => {
      const api = new AnimicaAPI(config.node);
      await api.init();
      return api;
    },
  };
}
