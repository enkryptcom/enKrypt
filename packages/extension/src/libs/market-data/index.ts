import { InternalStorageNamespace } from "@/types/provider";
import BrowserStorage from "../common/browser-storage";
import {
  StorageKeys,
  CoinGeckoToken,
  CoinGeckoTokenMarket,
  FiatMarket,
} from "./types";
import BigNumber from "bignumber.js";
import { CoingeckoPlatform } from "@enkryptcom/types";
import {
  getAllPlatformData,
  getMarketInfoByIDs,
  getUSDPriceById,
} from "./ethvm";
const FIAT_EXCHANGE_RATE_ENDPOINT =
  "https://mainnet.mewwallet.dev/v2/prices/exchange-rates";
const REFRESH_DELAY = 1000 * 60 * 5;

class MarketData {
  #storage: BrowserStorage;
  constructor() {
    this.#storage = new BrowserStorage(InternalStorageNamespace.marketData);
  }
  async getTokenValue(
    tokenBalance: string,
    coingeckoID: string,
    fiatSymbol: string
  ): Promise<string> {
    await this.setMarketInfo();
    const balanceBN = new BigNumber(tokenBalance);
    const market = (await this.getMarketData([coingeckoID]))[0];
    const fiat = await this.getFiatValue(fiatSymbol);
    if (market && fiat) {
      return balanceBN
        .multipliedBy(market.current_price)
        .multipliedBy(fiat.exchange_rate)
        .toFixed(2);
    }
    return "0";
  }
  async getTokenPrice(coingeckoID: string): Promise<string | null> {
    return getUSDPriceById(coingeckoID);
  }
  async getMarketInfoByContracts(
    contracts: string[],
    platformId: CoingeckoPlatform
  ): Promise<Record<string, CoinGeckoTokenMarket | null>> {
    await this.setMarketInfo();
    const allTokens = Object.values(await this.#getAllTokens());
    const requested: Record<string, CoinGeckoTokenMarket | null> = {};
    const contractTokenMap: Record<string, string | null> = {};
    contracts.forEach((add) => (contractTokenMap[add] = null));
    const tokenIds = allTokens
      .filter((token) => {
        if (
          token.platforms[platformId] &&
          contracts.includes(token.platforms[platformId])
        ) {
          contractTokenMap[token.platforms[platformId]] = token.id;
          return true;
        }
        return false;
      })
      .map((token) => token.id);
    if (!tokenIds.length) return requested;
    const marketData = await this.getMarketData(tokenIds);
    Object.keys(contractTokenMap).forEach((contract) => {
      if (contractTokenMap[contract]) {
        requested[contract] =
          marketData.find((data) => data?.id === contractTokenMap[contract]) ||
          null;
      } else {
        requested[contract] = null;
      }
    });
    return requested;
  }
  async getMarketData(
    coingeckoIDs: string[]
  ): Promise<Array<CoinGeckoTokenMarket | null>> {
    return getMarketInfoByIDs(coingeckoIDs).catch(() =>
      coingeckoIDs.map(() => null)
    );
  }
  async getFiatValue(symbol: string): Promise<FiatMarket | null> {
    await this.setMarketInfo();
    const allFiatData = await this.#storage.get(StorageKeys.fiatInfo);
    if (allFiatData[symbol]) return allFiatData[symbol];
    return null;
  }
  async #getLastTimestamp(): Promise<number | null> {
    const timestamp = await this.#storage.get(StorageKeys.lastTimestamp);
    if (timestamp) return timestamp.timestamp;
    return null;
  }
  async #setLastTimestamp(timestamp: number): Promise<void> {
    await this.#storage.set(StorageKeys.lastTimestamp, { timestamp });
  }
  async #setAllTokens(tokens: Record<string, CoinGeckoToken>): Promise<void> {
    await this.#storage.set(StorageKeys.allTokens, tokens);
  }
  async #getAllTokens(): Promise<Record<string, CoinGeckoToken>> {
    return await this.#storage.get(StorageKeys.allTokens);
  }
  async #setFiatExchangeRates(
    tokens: Record<string, FiatMarket>
  ): Promise<void> {
    await this.#storage.set(StorageKeys.fiatInfo, tokens);
  }
  async setMarketInfo(): Promise<void> {
    const lastTimestamp = await this.#getLastTimestamp();
    if (lastTimestamp && lastTimestamp >= new Date().getTime() - REFRESH_DELAY)
      return;

    const allCoins = await getAllPlatformData().then((json) => {
      const allTokens = json as CoinGeckoToken[];
      const tokens: Record<string, CoinGeckoToken> = {};
      allTokens.forEach((token) => {
        tokens[token.id] = token;
      });
      return tokens;
    });
    await this.#setAllTokens(allCoins);
    const fiatMarketData = await fetch(`${FIAT_EXCHANGE_RATE_ENDPOINT}`)
      .then((res) => res.json())
      .then((json) => {
        const topMarkets = json as FiatMarket[];
        const tokens: Record<string, FiatMarket> = {};
        topMarkets.forEach((token) => {
          tokens[token.fiat_currency] = token;
        });
        return tokens;
      });
    await this.#setFiatExchangeRates(fiatMarketData);
    await this.#setLastTimestamp(new Date().getTime());
  }
}
export default MarketData;
