import {
  BaseToken,
  BaseTokenOptions,
  SendOptions,
  TransferType,
} from "@/types/base-token";
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

  public async send(
    api: any,
    to: string,
    amount: string,
    options: SendOptions
  ): Promise<any> {
    throw new Error("EVM-send is not implemented here");
    // const transferType: TransferType = options ? options.type : "keepAlive";

    // switch (transferType) {
    //   case "transfer":
    //     return (api as ApiPromise).tx.balances.transfer(to, amount);
    //   case "keepAlive":
    //     return (api as ApiPromise).tx.balances.transferKeepAlive(to, amount);
    //   case "all":
    //     return (api as ApiPromise).tx.balances.transferAll(to, false);
    //   case "allKeepAlive":
    //     return (api as ApiPromise).tx.balances.transferAll(to, true);
    // }
  }
}
