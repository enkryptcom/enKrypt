import type {
  InjectedAccount,
  InjectedAccounts,
  Unsubcall,
} from "@polkadot/extension-inject/types";

export default class Accounts implements InjectedAccounts {
  constructor(_sendRequest: SendRequest) {
    // sendRequest = _sendRequest;
  }

  public get(anyType?: boolean): Promise<InjectedAccount[]> {
    // return sendRequest("pub(accounts.list)", { anyType });
  }

  public subscribe(cb: (accounts: InjectedAccount[]) => unknown): Unsubcall {
    // sendRequest("pub(accounts.subscribe)", null, cb).catch((error: Error) =>
    //   console.error(error)
    // );
    // return (): void => {
    //   // FIXME we need the ability to unsubscribe
    // };
  }
}
