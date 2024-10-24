import { getCustomError } from '@/libs/error';
import { MiddlewareFunction } from '@enkryptcom/types';
import BitcoinProvider from '..';
import { WindowPromise } from '@/libs/window-promise';
import { SignPSBTOptions } from '../types';
import AccountState from '../libs/accounts-state';
import { ProviderRPCRequest } from '@/types/provider';
const method: MiddlewareFunction = function (
  this: BitcoinProvider,
  payload: ProviderRPCRequest,
  res,
  next,
): void {
  if (payload.method !== 'btc_signPsbt') return next();
  else {
    if (!payload.params || payload.params.length < 2) {
      return res(
        getCustomError('btc_signPsbt: invalid request not enough params'),
      );
    }
    if (!payload.options || !payload.options.domain) {
      return res(getCustomError('btc_signPsbt: invalid domain'));
    }
    const psbt = payload.params[0] as string;
    const options = payload.params[1] as SignPSBTOptions;
    const accountsState = new AccountState();

    accountsState
      .getApprovedAddresses(payload.options!.domain)
      .then(accounts => {
        if (!accounts.length) {
          return res(null, '');
        }
        this.KeyRing.getAccount(accounts[0]).then(acc => {
          if (!acc)
            return res(getCustomError('btc_signPsbt: account not found'));
          const windowPromise = new WindowPromise();
          windowPromise
            .getResponse(
              this.getUIPath(this.UIRoutes.btcSendTransaction.path),
              JSON.stringify({
                ...payload,
                params: [psbt, options, acc, this.network.name],
              }),
              true,
            )
            .then(({ error, result }) => {
              if (error) return res(error);
              res(null, JSON.parse(result as string));
            });
        });
      });
  }
};
export default method;
