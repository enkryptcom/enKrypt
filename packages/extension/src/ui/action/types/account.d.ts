import { Token } from "./token";

export interface Account {
  name: string;
  address: string;
  amount: number;
  primaryToken: Token;
}
