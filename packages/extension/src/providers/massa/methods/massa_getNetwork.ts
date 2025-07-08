import { MiddlewareFunction } from '@enkryptcom/types';
import {
  BackgroundProviderInterface,
  ProviderRPCRequest,
} from '@/types/provider';
import { NetworkNames } from '@enkryptcom/types';

const method: MiddlewareFunction = async function (
  this: BackgroundProviderInterface,
  payload: ProviderRPCRequest,
  res,
  next,
): Promise<void> {
  if (payload.method !== 'massa_getNetwork') return next();
  else {
    try {
      const currentNetwork = this.getCurrentNetwork();
      res(null, currentNetwork.name);
    } catch (error) {
      res(null, NetworkNames.Massa);
    }
  }
};

export default method;
