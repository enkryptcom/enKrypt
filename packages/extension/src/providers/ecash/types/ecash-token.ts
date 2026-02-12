import { BaseToken, BaseTokenOptions } from '@/types/base-token';
import { ChronikAPI } from '../libs/api-chronik';

export class ECashToken extends BaseToken {
  constructor(options: BaseTokenOptions) {
    super(options);
  }

  public async getLatestUserBalance(api: any, pubkey: string): Promise<string> {
    return (api as ChronikAPI).getBalance(pubkey);
  }

  public async send(): Promise<any> {
    throw new Error('ECash-send is not implemented here');
  }
}
