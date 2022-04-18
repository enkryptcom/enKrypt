import { InternalStorageNamespace } from "@/types/provider";
import BrowserStorage from "../common/browser-storage";
import {
  StorageKeys,
  CoinGeckoToken,
  CoinGeckoTokenMarket,
  FiatMarket,
} from "./types";
const COINGECKO_ENDPOINT = "https://api.coingecko.com/api/v3/";
const FIAT_EXCHANGE_RATE_ENDPOINT =
  "https://mainnet.mewwallet.dev/v2/prices/exchange-rates";
const REFRESH_DELAY = 1000 * 60 * 5;
import BigNumber from "bignumber.js";
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
    const market = await this.getMarketData(coingeckoID);
    const fiat = await this.getFiatValue(fiatSymbol);
    if (market && fiat) {
      return balanceBN
        .multipliedBy(market.current_price)
        .multipliedBy(fiat.exchange_rate)
        .toFixed(2);
    }
    return "0";
  }
  async getMarketData(
    coingeckoID: string
  ): Promise<CoinGeckoTokenMarket | null> {
    await this.setMarketInfo();
    const allMarketData = await this.#storage.get(StorageKeys.marketInfo);
    if (allMarketData[coingeckoID]) return allMarketData[coingeckoID];
    return null;
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
  async #setTopTokensMarket(
    tokens: Record<string, CoinGeckoTokenMarket>
  ): Promise<void> {
    await this.#storage.set(StorageKeys.marketInfo, tokens);
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
    console.log("market: updating");
    const allCoins = await fetch(
      `${COINGECKO_ENDPOINT}coins/list?include_platform=true`
    )
      .then((res) => res.json())
      .then((json) => {
        const allTokens = json as CoinGeckoToken[];
        const tokens: Record<string, CoinGeckoToken> = {};
        allTokens.forEach((token) => {
          tokens[token.id] = token;
        });
        return tokens;
      });
    await this.#setAllTokens(allCoins);
    const topTokensMarket = await fetch(
      `${COINGECKO_ENDPOINT}coins/markets?vs_currency=usd&order=market_cap_desc&per_page=250&page=1&sparkline=false`
    )
      .then((res) => res.json())
      .then((json) => {
        const topMarkets = json as CoinGeckoTokenMarket[];
        const tokens: Record<string, CoinGeckoTokenMarket> = {};
        topMarkets.forEach((token) => {
          tokens[token.id] = token;
        });
        return tokens;
      });
    await this.#setTopTokensMarket(topTokensMarket);
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
