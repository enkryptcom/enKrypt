import { BN, EVMTransaction } from "../../types";

export interface OneInchResponseType {
  error?: string;
  description?: string;
  toAmount: string;
  tx: {
    from: string;
    to: string;
    data: string;
    value: string;
    gasPrice: string;
  };
}
export interface OneInchSwapResponse {
  transactions: EVMTransaction[];
  toTokenAmount: BN;
  fromTokenAmount: BN;
}
