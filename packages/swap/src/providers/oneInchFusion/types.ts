import { BN, EVMTransaction } from "../../types";

export interface OneInchSwapResponse {
  transactions: EVMTransaction[];
  typedMessages: string[];
  toTokenAmount: BN;
  fromTokenAmount: BN;
  orderStruct: string;
  quoteId: string;
  orderHash: string;
  extension: string;
}
