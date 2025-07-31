import { MiddlewareFunction } from '@enkryptcom/types';
import { ProviderRPCRequest } from '@/types/provider';
import { Address } from '@massalabs/massa-web3';
import { getCustomError } from '@/libs/error';
import MassaProvider from '..';
import { MassaNetwork } from '../networks/massa-base';

const method: MiddlewareFunction = async function (
  this: MassaProvider,
  payload: ProviderRPCRequest,
  res,
  next,
): Promise<void> {
  if (payload.method !== 'massa_getBalance') return next();
  else {
    try {
      const address = payload.params?.[0];
      const network = this.network as MassaNetwork;
      if (!address || !network.isValidAddress(address)) {
        res(getCustomError('Please enter a valid Massa address'));
        return;
      }

      const api = await network.api();
      const balance = await api.getBalance(address);

      res(null, balance);
    } catch (error) {
      res(getCustomError('Could not fetch balance from network'));
    }
  }
};

export default method;
