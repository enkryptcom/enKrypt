import { BaseToken, BaseTokenOptions } from '@/types/base-token';
import { numberToHex } from 'web3-utils';
import erc20 from '../libs/abi/erc20';
import EvmAPI from '../libs/api';
import { NATIVE_TOKEN_ADDRESS } from '../libs/common';
import { BNType } from '@/providers/common/types';

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
    address: string,
  ): Promise<string> {
    if (this.contract === NATIVE_TOKEN_ADDRESS)
      return api.getBalance(address.toLowerCase());
    else {
      const contract = new api.web3.Contract(
        erc20 as any,
        this.contract.toLowerCase(),
      );
      return contract.methods
        .balanceOf(address.toLowerCase())
        .call()
        .then((val: BNType) => {
          const balance = numberToHex(val);
          this.balance = balance;
          return balance;
        });
    }
  }

  public async send(): Promise<any> {
    throw new Error('EVM-send is not implemented here');
  }
}
