import { fromBase, toBase } from "@enkryptcom/utils";
import { toBN } from "web3-utils";
import { BN, TokenType } from "./types";

class SwapToken {
  token: TokenType;

  constructor(token: TokenType) {
    this.token = token;
  }

  toReadable(amount: BN): string {
    return fromBase(amount.toString(), this.token.decimals);
  }

  toRaw(amount: string): BN {
    return toBN(toBase(amount, this.token.decimals));
  }
}
export default SwapToken;
