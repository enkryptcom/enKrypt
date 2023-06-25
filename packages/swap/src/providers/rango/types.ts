import { BN, EVMTransaction } from "../../types";

export interface RangoSwapResponse {
  transactions: EVMTransaction[];
  toTokenAmount: BN;
  fromTokenAmount: BN;
  requestId: string;
}
