import { BN, EVMTransaction } from "../../types";

export interface OneInchSwapResponse {
  transactions: EVMTransaction[];
  toTokenAmount: BN;
  fromTokenAmount: BN;
  orderStruct: string;
  quoteId: string;
  orderHash: string;
}
