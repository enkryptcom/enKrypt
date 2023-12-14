import { EnkryptAccount } from "@enkryptcom/types";
import { Token } from "./token";

export interface Account {
  name: string;
  address: string;
  amount: number;
  primaryToken: Token;
}

export interface AccountsHeaderData {
  selectedAccount: EnkryptAccount | null;
  activeAccounts: EnkryptAccount[];
  inactiveAccounts: EnkryptAccount[];
  activeBalances: string[];
}
