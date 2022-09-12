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

  public async getLatestUserBalance(
    api: ApiPromise,
    address: string
  ): Promise<string> {
    return api.query.assets.account(this.id, address).then((res) => {
      if (res) {
        const data = res.toJSON();
        const balance = data ? (data as any).balance.toString() : "0";
        this.balance = balance;
        return balance;
      }

      return "0";
    });
  }

  public async send(
    api: ApiPromise,
    to: string,
    amount: string,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _options?: SendOptions | undefined
  ): Promise<SubmittableExtrinsic<"promise", ISubmittableResult>> {
    return api.tx.assets.transferKeepAlive(this.id, { id: to }, amount);
  }
}
