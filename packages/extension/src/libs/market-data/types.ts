export enum StorageKeys {
  lastTimestamp = 'last-time-stamp',
  allTokens = 'all-tokens',
  fiatInfo = 'fiat-info',
}

export interface CoingeckPlatforms {
  [key: string]: any;
  ethereum?: string;
  'ethereum-classic'?: string;
  'binance-smart-chain'?: string;
  gochain?: string;
  'polygon-pos'?: string;
  moonbeam?: string;
  rootstock?: string;
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
  current_price: null | number;
  market_cap: number;
  market_cap_rank: number;
  high_24h: number;
  low_24h: number;
  price_change_24h: number;
  price_change_percentage_24h: number;
  sparkline_in_24h: { price: number[] };
  price_change_percentage_24h_in_currency: number;
}
export interface FiatMarket {
  fiat_currency: string;
  exchange_rate: string;
}
