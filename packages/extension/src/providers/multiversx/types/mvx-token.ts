import MultiversXAPI from '@/providers/multiversx/libs/api';
import { BaseToken, BaseTokenOptions } from '@/types/base-token';

export class MVXToken extends BaseToken {
  constructor(options: BaseTokenOptions) {
    super(options);
  }

  public async getLatestUserBalance(
    api: MultiversXAPI,
    pubkey: string,
  ): Promise<string> {
    return api.getBalance(pubkey);
  }

  public async send(): Promise<any> {
    throw new Error('send is not implemented here');
  }
}
