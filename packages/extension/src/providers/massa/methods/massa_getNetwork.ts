import { MiddlewareFunction } from '@enkryptcom/types';
import { ProviderRPCRequest } from '@/types/provider';
import { NetworkNames } from '@enkryptcom/types';
import MassaProvider from '..';

const method: MiddlewareFunction = async function (
  this: MassaProvider,
  payload: ProviderRPCRequest,
  res,
  next,
): Promise<void> {
  if (payload.method !== 'massa_getNetwork') return next();
  else {
    try {
      res(null, this.network.name);
    } catch (error) {
      res(null, NetworkNames.Massa);
    }
  }
};

export default method;
