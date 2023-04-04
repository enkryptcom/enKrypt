import { TokenType } from "../../types";

export interface ChangellyCurrency {
  name: string;
  ticker: string;
  fullName: string;
  enabled: boolean;
  enabledFrom: boolean;
  enabledTo: boolean;
  fixRateEnabled: boolean;
  payinConfirmations: number;
  addressUrl: string;
  transactionUrl: string;
  image: string;
  protocol: string;
  blockchain: string;
  contractAddress?: string;
  token?: TokenType;
}
