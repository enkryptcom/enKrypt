import { Account } from "./account";
import { Token } from "./token";

export interface Transaction {
  from: Account;
  to: Account;
  token: Token;
  amount: number;
  cryptoAmount: number;
  status: TransactionStatus;
  date: number;
  direction: TransactionDirection;
}

export enum TransactionStatus {
  progress,
  success,
  failed,
}

export enum TransactionDirection {
  incoming,
  outgoing,
}
