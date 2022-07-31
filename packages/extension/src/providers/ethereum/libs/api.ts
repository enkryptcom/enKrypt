import { EthereumRawInfo } from "@/types/activity";
import { ProviderAPIInterface, Unsubscribe } from "@/types/provider";
import { isArray } from "lodash";
import Web3 from "web3";
import { numberToHex, toBN } from "web3-utils";
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
  async getTransactionStatus(hash: string): Promise<EthereumRawInfo | null> {
    try {
      const receipt = await this.web3.eth.getTransactionReceipt(hash);
      if (!receipt) return null;
      const [tx, block] = await Promise.all([
        this.web3.eth.getTransaction(hash),
        this.web3.eth.getBlock(receipt.blockNumber, false),
      ]);
      const info: EthereumRawInfo = {
        blockHash: receipt.blockHash,
        blockNumber: numberToHex(receipt.blockNumber),
        contractAddress: receipt.contractAddress || null,
        data: tx.input,
        effectiveGasPrice: tx.gasPrice,
        from: tx.from,
        to: tx.to,
        gas: numberToHex(tx.gas),
        gasUsed: numberToHex(receipt.gasUsed),
        nonce: numberToHex(tx.nonce),
        status: receipt.status,
        timestamp: toBN(block.timestamp).toNumber(),
        transactionHash: tx.hash,
        value: numberToHex(tx.value),
      };
      return info;
    } catch (e) {
      console.error(e);
      return null;
    }
  }
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
  async subscribeBalanceUpdate(
    address: string,
    update: (address: string, newBalance: string) => void
  ): Promise<Unsubscribe> {
    const currentBalance = await this.getBalance(address);
    update(address, currentBalance);

    const subscription = this.web3.eth.subscribe("newBlockHeaders", (error) => {
      if (error) {
        console.error(error);
      } else {
        this.getBalance(address).then((balance) => update(address, balance));
      }
    });

    const unsub = () => subscription.unsubscribe();

    return unsub as Unsubscribe;
  }
}
export default API;
