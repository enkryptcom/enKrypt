import { getCustomError } from '@/libs/error';
import { MiddlewareFunction } from '@enkryptcom/types';
import EthereumProvider from '..';
import { WindowPromise } from '@/libs/window-promise';
import { ProviderRPCRequest } from '@/types/provider';
const method: MiddlewareFunction = function (
  this: EthereumProvider,
  payload: ProviderRPCRequest,
  res,
  next,
): void {
  if (
    payload.method !== 'sol_signInMessage' &&
    payload.method !== 'sol_signMessage'
  )
    return next();
  else {
    if (!payload.params || payload.params.length < 1) {
      return res(getCustomError('sol_signInMessage: invalid params'));
    }
    const windowPromise = new WindowPromise();
    windowPromise
      .getResponse(
        this.getUIPath(this.UIRoutes.solSign.path),
        JSON.stringify({
          ...payload,
          params: [payload.method, payload.params[0], this.network.name],
        }),
        true,
      )
      .then(({ error, result }) => {
        if (error) return res(error);
        res(null, JSON.parse(result as string));
      });
  }
};
export default method;
