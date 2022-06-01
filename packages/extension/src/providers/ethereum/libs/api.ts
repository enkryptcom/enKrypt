import { ProviderAPIInterface } from "@/types/provider";
import Web3 from "web3";
import { fromWei } from "web3-utils";
import { ERC20TokenInfo } from "../types";
import erc20 from "./abi/erc20";
class API implements ProviderAPIInterface {
  node: string;
  web3: Web3;

  constructor(node: string) {
    this.node = node;
    this.web3 = new Web3(node);
  }

  public get api() {
    return this;
  }

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  async init(): Promise<void> {}
  getBalance(address: string): Promise<string> {
    return this.web3.eth.getBalance(address);
  }
  getBaseBalance(address: string): Promise<string> {
    return this.getBalance(address).then((bal) => fromWei(bal));
  }
  getTokenInfo = async (contractAddress: string): Promise<ERC20TokenInfo> => {
    const contract = new this.web3.eth.Contract(erc20 as any, contractAddress);
    try {
      const name = await contract.methods.name().call();
      const symbol = await contract.methods.symbol().call();
      const decimals = await contract.methods.decimals().call();
      return {
        name,
        symbol,
        decimals: parseInt(decimals),
      };
    } catch (e) {
      return {
        name: "Unknown",
        symbol: "UNKNWN",
        decimals: 18,
      };
    }
  };
}
export default API;
