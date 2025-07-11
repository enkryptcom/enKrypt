import { getCustomError } from '@/libs/error';
import { WindowPromise } from '@/libs/window-promise';
import { ProviderRPCRequest } from '@/types/provider';
import { MiddlewareFunction } from '@enkryptcom/types';
import MultiversXProvider from '..';
const method: MiddlewareFunction = function (
  this: MultiversXProvider,
  payload: ProviderRPCRequest,
  res,
  next,
): void {
  if (payload.method !== 'mvx_signTransaction') return next();
  else {
    if (!payload.params?.length) {
      return res(getCustomError('Missing Params: mvx_signTransaction'));
    }

    const reqPayload = payload.params[0];

    this.KeyRing.getAccount(reqPayload.address)
      .then(account => {
        const windowPromise = new WindowPromise();

        windowPromise
          .getResponse(
            this.getUIPath(this.UIRoutes.mvxSignMessage.path),
            JSON.stringify({
              ...payload,
              params: [reqPayload, account],
            }),
            true,
          )
          .then(({ error, result }) => {
            if (error) return res(error);
            res(null, result as string);
          });
      })
      .catch(res);
  }
};

export default method;
