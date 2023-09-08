import { BaseToken, BaseTokenOptions } from "@/types/base-token";
import KadenaAPI from "@/providers/kadena/libs/api";

export class KDAToken extends BaseToken {
  constructor(options: BaseTokenOptions) {
    super(options);
  }

  public async getLatestUserBalance(
    api: KadenaAPI,
    pubkey: string
  ): Promise<string> {
    return api.getBalance(pubkey);
  }

  public async send(): Promise<any> {
    throw new Error("EVM-send is not implemented here");
  }
}
