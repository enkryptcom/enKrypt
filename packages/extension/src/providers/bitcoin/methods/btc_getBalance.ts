import { MiddlewareFunction } from '@enkryptcom/types';
import { ProviderRPCRequest } from '@/types/provider';
import { getCustomError } from '@/libs/error';
import BitcoinProvider from '..';
import AccountState from '../libs/accounts-state';
const method: MiddlewareFunction = function (
  this: BitcoinProvider,
  payload: ProviderRPCRequest,
  res,
  next,
): void {
  if (payload.method !== 'btc_getBalance') return next();
  else {
    if (!payload.options || !payload.options.domain) {
      return res(getCustomError('btc_getNetwork: invalid domain'));
    }
    const accountsState = new AccountState();

    accountsState
      .getApprovedAddresses(payload.options!.domain)
      .then(accounts => {
        if (!accounts.length) {
          return res(null, '');
        }
        this.network.api().then(api => {
          api.getBalance(this.network.displayAddress(accounts[0])).then(bal => {
            res(null, {
              confirmed: parseInt(bal),
              unconfirmed: 0,
              total: parseInt(bal),
            });
          });
        });
      });
  }
};
export default method;
