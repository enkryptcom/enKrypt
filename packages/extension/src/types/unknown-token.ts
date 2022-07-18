import API from "@/providers/ethereum/libs/api";
import { ApiPromise } from "@polkadot/api";
import { BaseToken, BaseTokenOptions, SendOptions } from "./base-token";

export class UnknownToken extends BaseToken {
  constructor(options: BaseTokenOptions) {
    super(options);
  }

  public async getLatestUserBalance(
    _api: API | ApiPromise,
    _address: string
  ): Promise<string> {
    return "";
  }

  public async send(
    _api: API | ApiPromise,
    _to: string,
    _amount: string,
    _options?: SendOptions | undefined
  ): Promise<any> {
    return null;
  }
}
