import { NetworkNames } from '@enkryptcom/types';
import { BaseNetwork } from '@/types/base-network';
import MassaAPI from '../libs/api';
import { SignerType } from '@enkryptcom/types';
import { ProviderName } from '@/types/provider';
import { MassaNetworkOptions } from '../types';
import { Activity } from '@/types/activity';
import { AssetsType } from '@/types/provider';
import { fromBase } from '@enkryptcom/utils';
import { formatFloatingPointValue } from '@/libs/utils/number-formatter';
import MarketData from '@/libs/market-data';
import BigNumber from 'bignumber.js';
import icon from './icons/Massa_logo.webp';
import createIcon from '../../ethereum/libs/blockies';
import { TokensState } from '@/libs/tokens-state';
import { CustomMassaToken, TokenType } from '@/libs/tokens-state/types';
import Sparkline from '@/libs/sparkline';
import { MassaActivity } from '../libs/activity-handlers';
import wrapActivityHandler from '@/libs/activity-state/wrap-activity-handler';
import { Address } from '@massalabs/massa-web3';

export class MassaNetwork extends BaseNetwork {
  chainId: bigint;
  private activityHandler?: (
    network: BaseNetwork,
    address: string,
  ) => Promise<Activity[]>;

  constructor(options: MassaNetworkOptions) {
    super(options);
    this.chainId = options.chainId!;
    this.activityHandler =
      options.activityHandler || wrapActivityHandler(MassaActivity);
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
      } catch {
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

      const assets = [nativeTokenAsset];

      // Add custom tokens support
      const tokensState = new TokensState();
      const customTokens = await tokensState
        .getTokensByNetwork(this.name)
        .then(tokens => {
          const erc20Tokens = tokens.filter(token => {
            if (token.type !== TokenType.ERC20) {
              return false;
            }

            for (const a of assets) {
              if (
                a.contract &&
                (token as CustomMassaToken).address &&
                a.contract.toLowerCase() ===
                  (token as CustomMassaToken).address.toLowerCase()
              ) {
                return false;
              }
            }

            return true;
          }) as CustomMassaToken[];

          return erc20Tokens.map(
            ({ name, symbol, address, icon, decimals }) => {
              return {
                name,
                symbol,
                contract: address,
                icon,
                decimals,
                balance: '0', // Will be fetched below
              };
            },
          );
        });

      // Fetch balances for custom tokens
      const balancePromises = customTokens.map(async token => {
        try {
          return api.getBalanceMRC20(address, token.contract);
        } catch {
          return '0';
        }
      });

      const balances = await Promise.all(balancePromises);

      // Update token balances with fetched values
      customTokens.forEach((token, index) => {
        token.balance = balances[index];
      });

      const marketData = new MarketData();
      const marketInfos = await marketData.getMarketInfoByContracts(
        customTokens.map(token => token.contract.toLowerCase()),
        this.coingeckoPlatform!,
      );

      const customAssets: AssetsType[] = customTokens.map(token => {
        const asset: AssetsType = {
          name: token.name,
          symbol: token.symbol,
          balance: token.balance ?? '0',
          balancef: formatFloatingPointValue(
            fromBase(token.balance ?? '0', token.decimals),
          ).value,
          contract: token.contract,
          balanceUSD: 0,
          balanceUSDf: '0',
          value: '0',
          valuef: '0',
          decimals: token.decimals,
          sparkline: '',
          priceChangePercentage: 0,
          icon: token.icon,
        };

        // Check if token is a stablecoin (contains DAI or USD in symbol)
        const isStablecoin =
          token.symbol.toUpperCase().includes('DAI') ||
          token.symbol.toUpperCase().includes('USD');

        if (isStablecoin) {
          // Use $1 price for stablecoins
          const usdBalance = new BigNumber(
            fromBase(token.balance ?? '0', token.decimals),
          ).times(1);
          asset.balanceUSD = usdBalance.toNumber();
          asset.balanceUSDf = usdBalance.toString();
          asset.value = '1';
          asset.valuef = '1';
          asset.priceChangePercentage = 0;
        } else {
          // Use real market data for other tokens
          const marketInfo = marketInfos[token.contract.toLowerCase()];

          if (marketInfo) {
            const usdBalance = new BigNumber(
              fromBase(token.balance ?? '0', token.decimals),
            ).times(marketInfo.current_price ?? 0);
            asset.balanceUSD = usdBalance.toNumber();
            asset.balanceUSDf = usdBalance.toString();
            asset.value = marketInfo.current_price?.toString() ?? '0';
            asset.valuef = marketInfo.current_price?.toString() ?? '0';
            asset.sparkline = new Sparkline(
              marketInfo.sparkline_in_24h.price,
              25,
            ).dataValues;
            asset.priceChangePercentage =
              marketInfo.price_change_percentage_24h_in_currency || 0;
          }
        }

        return asset;
      });

      return [...assets, ...customAssets];
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

  isValidAddress = (address: string): boolean => {
    try {
      Address.fromString(address);
    } catch {
      return false;
    }
    return true;
  };
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
    customTokens: true,
    api: async () => {
      const api = new MassaAPI(config.node);
      await api.init();
      return api;
    },
  };
}
