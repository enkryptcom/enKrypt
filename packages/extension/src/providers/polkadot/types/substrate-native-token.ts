import { BaseToken, BaseTokenOptions } from "@/types/base-token";
import { ApiPromise } from "@polkadot/api";
import { AccountInfoWithRefCount } from "@polkadot/types/interfaces";

export class SubstrateNativeToken extends BaseToken {
  constructor(options: BaseTokenOptions) {
    super(options);
  }

  public async getUserBalance(api: ApiPromise, address: any): Promise<string> {
    return api.query.system
      .account<AccountInfoWithRefCount>(address)
      .then(({ data }) => data.free.toString());
  }

  public async send(api: any, to: string, amount: string): Promise<any> {
    return (api as ApiPromise).tx.balances.transferKeepAlive(to, amount);
  }
}
