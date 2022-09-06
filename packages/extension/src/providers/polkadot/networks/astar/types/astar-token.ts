import { SubstrateToken } from "@/providers/polkadot/types/substrate-token";
import { BaseTokenOptions, SendOptions } from "@/types/base-token";
import { ApiPromise } from "@polkadot/api";
import { SubmittableExtrinsic } from "@polkadot/api/types";
import { ISubmittableResult } from "@polkadot/types/types";

export interface AstarTokenOptions extends BaseTokenOptions {
  id: string;
}

export class AstarToken extends SubstrateToken {
  private id: string;
  constructor(options: AstarTokenOptions) {
    super(options);
    this.id = options.id;
  }

  public getLatestUserBalance(
    api: ApiPromise,
    address: string
  ): Promise<string> {
    return Promise.resolve("0");
  }

  public send(
    api: ApiPromise,
    to: string,
    amount: string,
    options?: SendOptions | undefined
  ): Promise<SubmittableExtrinsic<"promise", ISubmittableResult>> {
    return Promise.resolve(null as any);
  }
}
