import { BN, EVMTransaction } from "../../types";

export interface PropellerHeadsResponseType {
  request_id: string;
  solutions: [
    {
      orders: [
        {
          origin_address: string;
          sell_token: string;
          buy_token: string;
          sell_amount: string;
          executed_sell_amount: string;
          buy_amount: string;
          executed_buy_amount: string;
          external_id: string;
          receiver: string;
        }
      ];
      call_data: string;
      gas: string;
      target_address: string;
    }
  ];
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
