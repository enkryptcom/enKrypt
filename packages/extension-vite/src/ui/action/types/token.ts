export interface Token {
  name: string;
  symbol: string;
  icon: string;
  amount: string | number;
  price: number;
}
export interface ToTokenData {
  icon: string;
  symbol: string;
  amount: string;
  valueUSD: string;
  decimals: number;
  price: string;
  name: string;
}
