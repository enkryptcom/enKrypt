import { BaseToken, BaseTokenOptions } from "@/types/base-token";
import BitcoinAPI from "@/providers/bitcoin/libs/api";

export class BTCToken extends BaseToken {
  constructor(options: BaseTokenOptions) {
    super(options);
  }

  public async getLatestUserBalance(
    api: BitcoinAPI,
    pubkey: string
  ): Promise<string> {
    return api.getBalance(pubkey);
  }

  public async send(): Promise<any> {
    throw new Error("EVM-send is not implemented here");
  }
}
