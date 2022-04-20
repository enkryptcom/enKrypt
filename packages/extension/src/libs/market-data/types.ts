export enum StorageKeys {
  lastTimestamp = "last-time-stamp",
  allTokens = "all-tokens",
  fiatInfo = "fiat-info",
}

export interface CoingeckPlatforms {
  [key: string]: any;
  ethereum?: string;
  "ethereum-classic"?: string;
  "binance-smart-chain"?: string;
  gochain?: string;
  "polygon-pos"?: string;
  moonbeam?: string;
}
export interface CoinGeckoToken {
  id: string;
  symbol: string;
  name: string;
  platforms: CoingeckPlatforms;
}
export interface CoinGeckoTokenMarket {
  id: string;
  symbol: string;
  name: string;
  image: string;
  current_price: number;
  market_cap: number;
  market_cap_rank: number;
}
export interface FiatMarket {
  fiat_currency: string;
  exchange_rate: string;
}
