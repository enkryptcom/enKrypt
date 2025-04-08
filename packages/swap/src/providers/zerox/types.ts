import { BN, EVMTransaction } from "../../types";


export interface ZeroXResponseTransactionType {
  to: string;
  data: string;
  gas: string;
  gasPrice: string;
  value: string;
}

export interface ZeroXResponseType {
  name?: string;
  message?: string;
  buyAmount: string;
  sellAmount: string;
  transaction: ZeroXResponseTransactionType;
}

export interface ZeroXSwapResponse {
  transactions: EVMTransaction[];
  toTokenAmount: BN;
  fromTokenAmount: BN;
}
