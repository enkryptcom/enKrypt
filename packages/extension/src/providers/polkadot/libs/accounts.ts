import type {
  InjectedAccount,
  InjectedAccounts,
  Unsubcall,
} from "@polkadot/extension-inject/types";
import { InjectLibOptions, InjectedSendMessageHandler } from "../types";

export default class Accounts implements InjectedAccounts {
  sendMessageHandler: InjectedSendMessageHandler;
  id: number;
  constructor(options: InjectLibOptions) {
    this.sendMessageHandler = options.sendMessageHandler;
    this.id = options.id;
  }

  public get(anyType?: boolean): Promise<InjectedAccount[]> {
    return this.sendMessageHandler(this.id, {
      method: "dot_accounts",
      params: [!!anyType],
    });
  }

  public subscribe(cb: (accounts: InjectedAccount[]) => unknown): Unsubcall {
    this.sendMessageHandler(this.id, {
      method: "dot_accounts",
    }).then((res) => {
      cb(res);
    });
    return (): void => {
      //onshot for now since, not even polkadotjs has subscriptions
    };
  }
}
