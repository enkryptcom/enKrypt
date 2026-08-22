import { MiddlewareFunction } from '@enkryptcom/types';
import { BackgroundProviderInterface } from '@/types/provider';

export default (
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _provider: BackgroundProviderInterface,
): MiddlewareFunction[] => {
  // Animica has no dApp (injected) provider; requests go straight to the node.
  return [
    async (request, response, next) => {
      return next();
    },
  ];
};
