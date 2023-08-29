import { BN, EVMTransaction } from "../../types";

export interface RangoSwapResponse {
  transactions: EVMTransaction[];
  additionalNativeFees: BN;
  toTokenAmount: BN;
  fromTokenAmount: BN;
  requestId: string;
}
