import { BaseToken, SendOptions } from "@/types/base-token";
import { ApiPromise } from "@polkadot/api";
import { SubmittableExtrinsic } from "@polkadot/api/types";
import { ISubmittableResult } from "@polkadot/types/types";

export abstract class SubstrateToken extends BaseToken {
  public abstract send(
    api: ApiPromise,
    to: string,
    amount: string,
    options?: SendOptions
  ): Promise<SubmittableExtrinsic<"promise", ISubmittableResult>>;
}
