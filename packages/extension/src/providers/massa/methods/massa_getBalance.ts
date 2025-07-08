import { MiddlewareFunction } from '@enkryptcom/types';
import {
  BackgroundProviderInterface,
  ProviderRPCRequest,
} from '@/types/provider';
import { Address } from '@massalabs/massa-web3';
import { getCustomError } from '@/libs/error';

const isValidMassaAddress = (address: string): boolean => {
  try {
    Address.fromString(address);
  } catch (error) {
    return false;
  }
  return true;
};

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
      if (!address || !isValidMassaAddress(address)) {
        res(getCustomError('Please enter a valid Massa address'));
        return;
      }

      const currentNetwork = this.getCurrentNetwork();

      const api = await currentNetwork.api();

      const balance = await api.getBalance(address);

      res(null, balance);
    } catch (error) {
      res(getCustomError('Could not fetch balance from network'));
    }
  }
};

export default method;
