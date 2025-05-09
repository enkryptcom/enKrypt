export interface SIDOptions {
  node: {
    bnb: string;
    arb: string;
  };
  timeout?: number
}

export type Protocol = "EVM" | "Solana" | "PaymentID";
export enum PaymentIdChain {
  Bitcoin = 0,
  Ethereum = 1,
  Solana = 2,
  Tron = 3,
  Aptos = 4,
  Sui = 5,
}
export const PAYMENT_ID_CHAINS_MAP = {
  "bitcoin": 0,
  "ethereum": 1,
  "solana": 2,
  "tron": 3,
  "aptos": 4,
  "sui": 5,
};
export type Method =
  | "getAddress"
  | "getDomainName"
  | "batchGetDomainNameByChainId"
  | "getMetadata"
  | "getContentHash";


export const TIMEOUT_PRESETS = {
  veryShort: 100, // Intentionally short to test timeout
  normal: 5000, // Normal timeout (5s)
  long: 15000, // Long timeout (15s)
};