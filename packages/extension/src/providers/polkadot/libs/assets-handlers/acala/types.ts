export interface AcalaTokenType {
  name: string;
  symbol: string;
  image: string;
  decimals: number;
  coingeckoID?: string;
  foreignAssetId?: number;
  stableAssetId?: number;
  erc20Address?: string;
  crowdloanId?: number;
  native?: boolean;
}
