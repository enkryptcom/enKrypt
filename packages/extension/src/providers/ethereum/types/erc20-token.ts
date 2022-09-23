import { BaseToken, BaseTokenOptions } from "@/types/base-token";
import { BN } from "ethereumjs-util";
import { numberToHex } from "web3-utils";
import erc20 from "../libs/abi/erc20";
import EvmAPI from "../libs/api";
import { NATIVE_TOKEN_ADDRESS } from "../libs/common";

export interface Erc20TokenOptions extends BaseTokenOptions {
  contract: string;
}

export class Erc20Token extends BaseToken {
  public contract: string;

  constructor(options: Erc20TokenOptions) {
    super(options);
    this.contract = options.contract;
  }

  public async getLatestUserBalance(
    api: EvmAPI,
    address: string
  ): Promise<string> {
    if (this.contract === NATIVE_TOKEN_ADDRESS) return api.getBalance(address);
    else {
      const contract = new api.web3.Contract(erc20 as any, this.contract);
      return contract.methods
        .balanceOf(address)
        .call()
        .then((val: BN) => {
          const balance = numberToHex(val);
          this.balance = balance;
          return balance;
        });
    }
  }

  public async send(): Promise<any> {
    throw new Error("EVM-send is not implemented here");
  }
}
