import { BN, EVMTransaction } from "../../types";

export interface ParaswapResponseType {
  error?: string;
  from: string;
  to: string;
  data: string;
  value: string;
}
export interface ParaSwapSwapResponse {
  transactions: EVMTransaction[];
  toTokenAmount: BN;
  fromTokenAmount: BN;
}

export interface ParaswpQuoteResponse {
  blockNumber: number;
  network: number;
  srcToken: string;
  srcDecimals: number;
  srcAmount: string;
  destToken: string;
  destDecimals: number;
  destAmount: string;
  tokenTransferProxy: string;
  contractAddress: string;
  bestRoute: unknown;
}
