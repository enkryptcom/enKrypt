import { MiddlewareFunction } from '@enkryptcom/types';
import KadenaProvider from '..';
import { WindowPromise } from '@/libs/window-promise';
import { ProviderRPCRequest } from '@/types/provider';
import { getCustomError } from '@/libs/error';
const method: MiddlewareFunction = function (
  this: KadenaProvider,
  payload: ProviderRPCRequest,
  res,
  next,
): void {
  if (payload.method !== 'kda_signTransaction') return next();
  else {
    if (!payload.params?.length) {
      return res(getCustomError('Missing Params: kda_signTransaction'));
    }

    const reqPayload = payload.params[0];

    this.KeyRing.getAccount(reqPayload.address.replace('k:', '0x'))
      .then(account => {
        const windowPromise = new WindowPromise();

        windowPromise
          .getResponse(
            this.getUIPath(this.UIRoutes.kdaSignMessage.path),
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
