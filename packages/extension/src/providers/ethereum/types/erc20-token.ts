import { BaseToken, BaseTokenOptions } from '@/types/base-token';
import { numberToHex } from 'web3-utils';
import erc20 from '../libs/abi/erc20';
import EvmAPI from '../libs/api';
import { NATIVE_TOKEN_ADDRESS } from '../libs/common';
import { BNType } from '@/providers/common/types';
import {
  verifyErc20Balance,
  type VerificationResult,
} from '../libs/helios-verifier';

export interface Erc20TokenOptions extends BaseTokenOptions {
  contract: string;
}

export class Erc20Token extends BaseToken {
  public contract: string;
  public heliosVerification: VerificationResult | undefined = undefined;

  constructor(options: Erc20TokenOptions) {
    super(options);
    this.contract = options.contract;
  }

  public async getLatestUserBalance(
    api: EvmAPI,
    address: string,
    chainId?: string,
  ): Promise<string> {
    if (this.contract === NATIVE_TOKEN_ADDRESS)
      return api.getBalance(address.toLowerCase());

    const contract = new api.web3.Contract(
      erc20 as any,
      this.contract.toLowerCase(),
    );

    const balance: string = await contract.methods
      .balanceOf(address.toLowerCase())
      .call()
      .then((val: BNType) => {
        const hex = numberToHex(val);
        this.balance = hex;
        return hex;
      });

    if (chainId) {
      // blockTag is 'latest' because the web3 contract call does not expose
      verifyErc20Balance(
        this.contract,
        address.toLowerCase(),
        balance,
        'latest',
        chainId,
        api.node,
      )
        .then(result => {
          this.heliosVerification = result;
        })
        .catch(() => {});
    }

    return balance;
  }

  public async send(): Promise<any> {
    throw new Error('EVM-send is not implemented here');
  }
}