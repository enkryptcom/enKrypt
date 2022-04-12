import { KeyRecord } from "@enkryptcom/types";
import { Token } from "./token";

export interface Account {
  name: string;
  address: string;
  amount: number;
  primaryToken: Token;
}

export interface AccountsHeaderData {
  selectedAccount: KeyRecord | null;
  activeAccounts: KeyRecord[];
  inactiveAccounts: KeyRecord[];
}
