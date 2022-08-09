import { BaseToken, BaseTokenOptions } from "./base-token";

export class UnknownToken extends BaseToken {
  constructor(options: BaseTokenOptions) {
    super(options);
  }

  public async getLatestUserBalance(): Promise<string> {
    return "";
  }

  public async send(): Promise<any> {
    return null;
  }
}
