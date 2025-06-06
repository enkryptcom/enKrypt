import { MiddlewareFunction } from '@enkryptcom/types';
import SubstrateProvider from '..';
import { ProviderRPCRequest } from '@/types/provider';
import { polkadotEncodeAddress, utf8ToHex } from '@enkryptcom/utils';
import { SignerPayloadRaw } from '@polkadot/types/types';
import { getCustomError } from '@/libs/error';
import { WindowPromise } from '@/libs/window-promise';
const method: MiddlewareFunction = function (
  this: SubstrateProvider,
  payload: ProviderRPCRequest,
  res,
  next,
): void {
  if (payload.method !== 'dot_signer_signRaw') return next();
  else {
    if (!payload.params?.length)
      return res(getCustomError('Missing Params: signer_signPayload'));
    const reqPayload = payload.params[0] as SignerPayloadRaw;
    if (reqPayload.type !== 'bytes' && reqPayload.type !== 'payload')
      return res(getCustomError('type is not bytes: signer_signRaw'));
    const data =
      reqPayload.type === 'payload'
        ? utf8ToHex(reqPayload.data)
        : reqPayload.data;
    this.KeyRing.getAccount(polkadotEncodeAddress(reqPayload.address)).then(
      account => {
        const windowPromise = new WindowPromise();
        windowPromise
          .getResponse(
            this.getUIPath(this.UIRoutes.dotSignMessage.path),
            JSON.stringify({
              ...payload,
              params: [data, account],
            }),
            true,
          )
          .then(({ error, result }) => {
            if (error) return res(error);
            res(null, JSON.parse(result as string));
          });
      },
    );
  }
};
export default method;
