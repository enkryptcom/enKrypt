import { ProviderAPIInterface } from "@/types/provider";
import { isArray } from "lodash";
import Web3 from "web3";
import { ERC20TokenInfo } from "../types";
import erc20 from "./abi/erc20";
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
  getTokenInfo = async (contractAddress: string): Promise<ERC20TokenInfo> => {
    const contract = new this.web3.eth.Contract(erc20 as any, contractAddress);
    try {
      const results = await Promise.all([
        contract.methods.name().call(),
        contract.methods.symbol().call(),
        contract.methods.decimals().call(),
      ]);
      const name = results[0];
      const symbol = results[1];
      const decimals = results[2];
      if (isArray(name) || isArray(symbol) || isArray(decimals)) throw "";
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
