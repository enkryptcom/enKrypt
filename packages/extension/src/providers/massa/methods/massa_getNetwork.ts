import { MiddlewareFunction } from '@enkryptcom/types';
import { BackgroundProviderInterface, ProviderRPCRequest } from '@/types/provider';
import { CallbackFunction } from '@enkryptcom/types';
import DomainState from '@/libs/domain-state';
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
      const domainState = new DomainState();
      const selectedNetwork = await domainState.getSelectedNetWork();
      
      // Default to mainnet if no network is selected
      const network = selectedNetwork || NetworkNames.Massa;
      
      res(null, network);
    } catch (error) {
      console.error('Error in massa_getNetwork:', error);
      res(null, NetworkNames.Massa);
    }
  }
};

export default method; 