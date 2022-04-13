import { ProviderAPIInterface } from "@/types/provider";
import Web3 from "web3";
import { fromWei } from "web3-utils";
class API implements ProviderAPIInterface {
  node: string;
  web3: Web3;
  constructor(node: string) {
    this.node = node;
    this.web3 = new Web3(node);
  }
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  async init(): Promise<void> {}
  getBalance(address: string): Promise<string> {
    return this.web3.eth.getBalance(address);
  }
  getBaseBalance(address: string): Promise<string> {
    return this.getBalance(address).then((bal) => fromWei(bal));
  }
}
export default API;
