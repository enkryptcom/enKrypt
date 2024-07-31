import { BaseToken, BaseTokenOptions } from "@/types/base-token";
import SolanaAPI from "@/providers/bitcoin/libs/api";

export class SOLToken extends BaseToken {
  constructor(options: BaseTokenOptions) {
    super(options);
  }

  public async getLatestUserBalance(
    api: SolanaAPI,
    pubkey: string
  ): Promise<string> {
    return api.getBalance(pubkey);
  }

  public async send(): Promise<any> {
    throw new Error("sol-send is not implemented here");
  }
}
