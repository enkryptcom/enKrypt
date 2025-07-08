import { MiddlewareFunction } from '@enkryptcom/types';
import { BackgroundProviderInterface, ProviderRPCRequest } from '@/types/provider';
import { CallbackFunction } from '@enkryptcom/types';
import { SignerType } from '@enkryptcom/types';
import PublicKeyRing from '@/libs/keyring/public-keyring';
import { getNetworkByName } from '@/libs/utils/networks';
import { NetworkNames } from '@enkryptcom/types';
import { MassaNetwork } from '../networks/mainnet';

const method: MiddlewareFunction = async function (
  this: BackgroundProviderInterface,
  payload: ProviderRPCRequest,
  res,
  next,
): Promise<void> {
  if (payload.method !== 'massa_getAccounts') return next();
  else {
    try {
      const publicKeyring = new PublicKeyRing();
      const accounts = await publicKeyring.getAccounts([SignerType.ed25519]);
      
      const network = getNetworkByName(NetworkNames.Massa) as MassaNetwork;
      
      const massaAccounts = accounts.map(acc => network.displayAddress(acc.address));
      
      res(null, massaAccounts);
    } catch (error) {
      console.error('Error in massa_getAccounts:', error);
      res(null, []);
    }
  }
};

export default method; 