import { MiddlewareFunction } from '@enkryptcom/types';
import type EthereumProvider from '..';
import { ProviderRPCRequest } from '@/types/provider';
import AccountState from '../libs/accounts-state';
import { getCustomError } from '@/libs/error';
import openOnboard from '@/libs/utils/open-onboard';
import { throttle } from 'lodash';

const throttledOpenOnboard = throttle(() => openOnboard(), 10000);
const method: MiddlewareFunction = async function (
  this: EthereumProvider,
  payload: ProviderRPCRequest,
  res,
  next,
): Promise<void> {
  if (payload.method !== 'eth_accounts' && payload.method !== 'eth_coinbase')
    return next();
  else {
    const isInitialized = await this.KeyRing.isInitialized();
    if (payload.options && payload.options.domain) {
      if (!isInitialized) {
        res(null, payload.method === 'eth_coinbase' ? '' : []);
        return throttledOpenOnboard();
      }
      const accountsState = new AccountState();
      accountsState
        .getApprovedAddresses(payload.options.domain)
        .then(async accounts => {
          if (accounts.length) {
            const balances = await Promise.all(
              accounts.map(account => this.KeyRing.getBalance(account))
            );
            const accountsWithBalances = accounts.map((account, index) => ({
              account,
              balance: balances[index],
            }));
            res(
              null,
              payload.method === 'eth_coinbase'
                ? accountsWithBalances[0]
                : accountsWithBalances,
            );
          } else {
            res(null, payload.method === 'eth_coinbase' ? '' : []);
          }
        });
    } else {
      res(getCustomError('No domain set!'));
    }
  }
};
export default method;
