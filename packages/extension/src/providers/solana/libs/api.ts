import { SOLRawInfo } from "@/types/activity";
import { ProviderAPIInterface } from "@/types/provider";
import { getAddress as getSolAddress } from "../types/sol-network";

class API implements ProviderAPIInterface {
  node: string;

  constructor(node: string) {
    this.node = node;
  }

  public get api() {
    return this;
  }
  private getAddress(pubkey: string) {
    return getSolAddress(pubkey);
  }
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  async init(): Promise<void> {}
  async getTransactionStatus(hash: string): Promise<SOLRawInfo | null> {
    console.log(hash, "gettxstatus");
    return null;
  }
  async getBalance(pubkey: string): Promise<string> {
    console.log(pubkey, "getbalance");
    return "0";
  }
  async broadcastTx(rawtx: string): Promise<boolean> {
    console.log(rawtx, "broadcasttx");
    return true;
  }
}
export default API;
