import { BaseToken, BaseTokenOptions } from "@/types/base-token";

export interface ChangellyTokenOptions extends BaseTokenOptions {
  changellyID: string;
  blockchain: string;
  contract?: string;
}

export class ChangellyToken extends BaseToken {
  public changellyID: string;
  public blockchain: string;

  constructor(options: ChangellyTokenOptions) {
    super(options);
    this.changellyID = options.changellyID;
    this.blockchain = options.blockchain;
  }

  public async getLatestUserBalance(): Promise<string> {
    return "";
  }

  public async send(): Promise<any> {
    return null;
  }
}
