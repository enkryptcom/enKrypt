import { MiddlewareFunction } from '@enkryptcom/types';
import { BackgroundProviderInterface, ProviderRPCRequest } from '@/types/provider';
import { CallbackFunction } from '@enkryptcom/types';
import { getNetworkByName } from '@/libs/utils/networks';
import { NetworkNames } from '@enkryptcom/types';
import { MassaNetwork } from '../networks/mainnet';

const method: MiddlewareFunction = async function (
  this: BackgroundProviderInterface,
  payload: ProviderRPCRequest,
  res,
  next,
): Promise<void> {
  if (payload.method !== 'massa_getBalance') return next();
  else {
    try {
      const address = payload.params?.[0];
      if (!address) {
        res(new Error('Address parameter is required'), null);
        return;
      }

      const network = getNetworkByName(NetworkNames.Massa) as MassaNetwork;
      const api = await network.api();
      const balance = await api.getBalance(address);
      
      res(null, balance);
    } catch (error) {
      console.error('Error in massa_getBalance:', error);
      res(error, null);
    }
  }
};

export default method; 