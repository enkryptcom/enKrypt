import { MiddlewareFunction } from '@enkryptcom/types';
import { ProviderRPCRequest } from '@/types/provider';
import AccountState from '../libs/accounts-state';
import { getCustomError } from '@/libs/error';
import BitcoinProvider from '..';

const method: MiddlewareFunction = function (
  this: BitcoinProvider,
  payload: ProviderRPCRequest,
  res,
  next,
): void {
  if (payload.method !== 'btc_getPublicKey') return next();
  else {
    if (payload.options && payload.options.domain) {
      const accountsState = new AccountState();
      accountsState
        .getApprovedAddresses(payload.options.domain)
        .then(accounts => {
          if (accounts.length) {
            this.KeyRing.getAccount(accounts[0]).then(pubAccounts => {
              res(null, pubAccounts.address.replace('0x', ''));
            });
          } else {
            res(null, '');
          }
        });
    } else {
      res(getCustomError('No domain set!'));
    }
  }
};
export default method;
