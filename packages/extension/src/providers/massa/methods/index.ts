import { MiddlewareFunction } from '@enkryptcom/types';
import { BackgroundProviderInterface } from '@/types/provider';
import massa_getBalance from './massa_getBalance';
import massa_getNetwork from './massa_getNetwork';
import massa_setNetwork from './massa_setNetwork';

export default (
  provider: BackgroundProviderInterface,
): MiddlewareFunction[] => {
  return [
    massa_getBalance,
    massa_getNetwork,
    massa_setNetwork,
    async (request, response, next) => {
      // Add any additional Massa-specific middleware logic here
      return next();
    },
  ];
};
