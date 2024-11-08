import { getCustomError } from '@/libs/error';
import { MiddlewareFunction } from '@enkryptcom/types';
import BitcoinProvider from '..';
import { WindowPromise } from '@/libs/window-promise';
import { ProviderRPCRequest } from '@/types/provider';
import AccountState from '../libs/accounts-state';
const method: MiddlewareFunction = function (
  this: BitcoinProvider,
  payload: ProviderRPCRequest,
  res,
  next,
): void {
  if (payload.method !== 'btc_signMessage') return next();
  else {
    if (!payload.params || payload.params.length < 2) {
      return res(getCustomError('btc_signMessage: invalid params'));
    }
    if (!payload.options || !payload.options.domain) {
      return res(getCustomError('btc_signMessage: invalid domain'));
    }
    const msg = payload.params[0] as string;
    const type = payload.params[1] as string;
    const accountsState = new AccountState();

    accountsState
      .getApprovedAddresses(payload.options!.domain)
      .then(accounts => {
        if (!accounts.length) {
          return res(null, '');
        }
        this.KeyRing.getAccount(accounts[0]).then(acc => {
          if (!acc)
            return res(getCustomError('btc_signMessage: account not found'));
          const windowPromise = new WindowPromise();
          windowPromise
            .getResponse(
              this.getUIPath(this.UIRoutes.btcSign.path),
              JSON.stringify({
                ...payload,
                params: [msg, type, acc, this.network.name],
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
