import { BN, EVMTransaction } from "../../types";

export interface ZeroXResponseType {
  code?: number;
  reason?: string;
  buyTokenAddress: string;
  sellTokenAddress: string;
  buyAmount: string;
  sellAmount: string;
  to: string;
  data: string;
  value: string;
}
export interface ZeroXSwapResponse {
  transactions: EVMTransaction[];
  toTokenAmount: BN;
  fromTokenAmount: BN;
}
