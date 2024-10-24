import { MiddlewareFunction } from '@enkryptcom/types';
import KadenaProvider from '..';
import { ProviderRPCRequest } from '@/types/provider';
import { getCustomError } from '@/libs/error';
import type KadenaAPI from '@/providers/kadena/libs/api';

const method: MiddlewareFunction = function (
  this: KadenaProvider,
  payload: ProviderRPCRequest,
  res,
  next,
): void {
  if (payload.method !== 'kda_getBalance') return next();
  else {
    if (!payload.params || payload.params.length < 2) {
      return res(getCustomError('kda_getBalance: invalid params'));
    }

    const address = payload.params[0];
    const chainId =
      payload.params[1] ?? this.network.options.kadenaApiOptions.chainId;
    this.network.api().then(api => {
      (api as KadenaAPI).getBalanceByChainId(address, chainId).then(bal => {
        res(null, bal);
      });
    });
  }
};
export default method;
