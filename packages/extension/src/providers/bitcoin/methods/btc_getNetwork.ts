import { getCustomError } from '@/libs/error';
import { MiddlewareFunction, NetworkNames } from '@enkryptcom/types';
import BitcoinProvider from '..';
import AccountState from '../libs/accounts-state';
import { ProviderRPCRequest } from '@/types/provider';
const method: MiddlewareFunction = function (
  this: BitcoinProvider,
  payload: ProviderRPCRequest,
  res,
  next,
): void {
  if (payload.method !== 'btc_getNetwork') return next();
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
        if (this.network.name === NetworkNames.Bitcoin)
          return res(null, 'livenet');
        if (this.network.name === NetworkNames.BitcoinTest)
          return res(null, 'testnet');
        if (this.network.name === NetworkNames.Litecoin)
          return res(null, 'litecoin');
        res(null, '');
      });
  }
};
export default method;
