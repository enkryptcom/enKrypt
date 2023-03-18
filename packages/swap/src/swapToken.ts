import { TokenType } from "./types";

class SwapToken {
  token: TokenType;

  constructor(token: TokenType) {
    this.token = token;
  }

  toReadable() {}
}
export default SwapToken;
