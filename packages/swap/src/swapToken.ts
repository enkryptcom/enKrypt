import { fromBase, toBase } from "@enkryptcom/utils";
import BigNumber from "bignumber.js";
import { toBN } from "web3-utils";
import { BN, TokenType } from "./types";

class SwapToken {
  token: TokenType;

  constructor(token: TokenType) {
    this.token = token;
  }

  setBalance(balance: BN) {
    this.token.balance = balance;
  }

  getBalanceReadable(): string {
    if (!this.token.balance) return "0";
    return this.toReadable(this.token.balance);
  }

  getBalanceRaw(): BN {
    if (!this.token.balance) return toBN("0");
    return this.token.balance;
  }

  toReadable(amount: BN): string {
    return fromBase(amount.toString(), this.token.decimals);
  }

  toRaw(amount: string): BN {
    return toBN(toBase(amount, this.token.decimals));
  }

  getFiatTotal(): number {
    if (!this.token.balance || !this.token.price) return 0;
    return BigNumber(this.getBalanceReadable())
      .times(this.token.price)
      .toNumber();
  }

  getFiatValue(): number {
    if (!this.token.price) return 0;
    return this.token.price;
  }

  getReadableToFiat(value: string): number {
    if (!this.token.price) return 0;
    return BigNumber(value).times(this.token.price).toNumber();
  }

  getRawToFiat(value: BN): number {
    if (!this.token.price) return 0;
    return BigNumber(this.toReadable(value)).times(this.token.price).toNumber();
  }
}

export default SwapToken;
