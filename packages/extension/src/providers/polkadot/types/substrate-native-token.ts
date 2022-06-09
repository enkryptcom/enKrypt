import { BaseToken, BaseTokenOptions } from "@/types/base-token";
import { ApiPromise } from "@polkadot/api";
import { AccountInfoWithRefCount } from "@polkadot/types/interfaces";

export class SubstrateNativeToken extends BaseToken {
  constructor(options: BaseTokenOptions) {
    super(options);
  }

  public async getUserBalance(api: any, address: any): Promise<number> {
    console.log(api);
    return (api as ApiPromise).query.system
      .account<AccountInfoWithRefCount>(address)
      .then(({ data }) => data.free.toNumber());
  }

  public async send(api: any, to: string, amount: number): Promise<any> {
    return (api as ApiPromise).tx.balances.transferKeepAlive(to, amount);
  }
}
