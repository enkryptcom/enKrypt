import { MiddlewareFunction } from '@enkryptcom/types';
import { BackgroundProviderInterface, ProviderRPCRequest } from '@/types/provider';
import { CallbackFunction } from '@enkryptcom/types';
import massa_requestAccounts from './massa_requestAccounts';

const method: MiddlewareFunction = async function (
  this: BackgroundProviderInterface,
  payload: ProviderRPCRequest,
  res,
  next,
): Promise<void> {
  if (payload.method !== 'massa_connect') return next();
  else {
    // Alias for massa_requestAccounts
    payload.method = 'massa_requestAccounts';
    return massa_requestAccounts.call(this, payload, res, next);
  }
};

export default method; 