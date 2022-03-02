import type {
  InjectedAccount,
  InjectedAccounts,
  Unsubcall,
} from "@polkadot/extension-inject/types";

export default class Accounts implements InjectedAccounts {
  constructor() {
    // sendRequest = _sendRequest;
  }

  public get(anyType?: boolean): Promise<InjectedAccount[]> {
    console.log("get accounts");
    return Promise.resolve([
      {
        address: "5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY",
        genesisHash: "",
        name: "abcd",
        type: "sr25519",
      },
    ]);
  }

  public subscribe(cb: (accounts: InjectedAccount[]) => unknown): Unsubcall {
    console.log("acccount subsribe called");
    cb([
      {
        address: "5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY",
        genesisHash: "",
        name: "abcd",
        type: "sr25519",
      },
    ]);
    return (): void => {
      // FIXME we need the ability to unsubscribe
    };
  }
}
