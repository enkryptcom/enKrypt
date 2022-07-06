export interface TransactionFee {
  limit: number;
  price: TransactionFeePrice;
  symbol?: string;
}

export interface TransactionFeePrice {
  speed: TransactionFeeSpeed;
  baseFee: number;
  tip: number;
  totalFee: number;
  title: string;
  description: string;
}

export enum TransactionFeeSpeed {
  zero = 0,
  legacy = 1,
  opportunistic = 0.9,
  economy = 1,
  recommended = 1.25,
  higherPriority = 1.5,
  highestPriority = 1.75,
}
