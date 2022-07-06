import {
  BaseToken,
  BaseTokenOptions,
  SendOptions,
  TransferType,
} from "@/types/base-token";
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

  public async send(
    api: any,
    to: string,
    amount: string,
    options: SendOptions
  ): Promise<any> {
    const transferType: TransferType = options ? options.type : "transfer";

    switch (transferType) {
      case "transfer":
        return (api as ApiPromise).tx.balances.transfer(to, amount);
      case "keepAlive":
        return (api as ApiPromise).tx.balances.transferKeepAlive(to, amount);
      case "all":
        return (api as ApiPromise).tx.balances.transferAll(to, false);
      case "allKeepAlive":
        return (api as ApiPromise).tx.balances.transferAll(to, true);
    }
  }
}
