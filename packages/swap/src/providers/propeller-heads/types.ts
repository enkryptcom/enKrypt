import { BN, EVMTransaction } from "../../types";

export interface PropellerHeadsResponseType {
  request_id: string;
  quotes: [
    {
      sell_token: string;
      buy_token: string;
      sell_amount: string;
      buy_amount: string;
      external_id: string;
    }
  ];
  gas: number;
  buy_tokens: [
    {
      symbol: string;
      decimals: string;
      address: string;
    }
  ];
  sell_tokens: [
    {
      symbol: string;
      decimals: string;
      address: string;
    }
  ];
}
export interface PropellerHeadsSwapResponse {
  transactions: EVMTransaction[];
  toTokenAmount: BN;
  fromTokenAmount: BN;
}
