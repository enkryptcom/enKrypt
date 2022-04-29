export interface AcalaTokenType {
  name: string;
  symbol: string;
  image: string;
  decimals: number;
  coingeckoID: string;
  crowdloanId?: number;
  native?: boolean;
}
