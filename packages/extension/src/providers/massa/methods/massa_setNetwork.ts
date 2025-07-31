import { MiddlewareFunction } from '@enkryptcom/types';
import { ProviderRPCRequest } from '@/types/provider';
import { getCustomError } from '@/libs/error';
import massaNetworks from '../networks';
import MassaProvider from '..';

const method: MiddlewareFunction = async function (
  this: MassaProvider,
  payload: ProviderRPCRequest,
  res,
  next,
): Promise<void> {
  if (payload.method !== 'massa_setNetwork') return next();
  else {
    try {
      const networkName = payload.params?.[0];

      if (!networkName) {
        res(getCustomError('Network name is required'));
        return;
      }

      // Check if the network exists
      const availableNetworks = Object.keys(massaNetworks);

      if (!availableNetworks.includes(networkName)) {
        res(
          getCustomError(
            `Invalid network name. Available networks: ${availableNetworks.join(', ')}`,
          ),
        );
        return;
      }

      // Get the network object
      const network = massaNetworks[networkName as keyof typeof massaNetworks];

      // Set the network in the provider
      if (this.setRequestProvider) {
        this.setRequestProvider(network);
        res(null, { success: true, network: network.name });
      } else {
        res(getCustomError('Network switching not supported'));
      }
    } catch (error) {
      res(
        getCustomError(
          `Network switching failed: ${(error as Error).message || 'Unknown error'}`,
        ),
      );
    }
  }
};

export default method;
