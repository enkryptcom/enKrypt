import { getCustomError } from '@/libs/error';
import { MiddlewareFunction } from '@enkryptcom/types';
import SolanaProvider from '..';
import { WindowPromise } from '@/libs/window-promise';
import bs58 from 'bs58';
import { bufferToHex } from '@enkryptcom/utils';
import { SolSignTransactionRequest } from '../ui/types';
const method: MiddlewareFunction = function (
  this: SolanaProvider,
  payload,
  res,
  next,
): void {
  if (
    payload.method !== 'sol_signTransaction' &&
    payload.method !== 'sol_signAndSendTransaction'
  )
    return next();
  else {
    if (!payload.params || payload.params.length < 1) {
      return res(
        getCustomError(
          'eth_sendTransaction: invalid request not enough params',
        ),
      );
    }
    const txMessage = JSON.parse(
      payload.params[0],
    ) as SolSignTransactionRequest;
    this.KeyRing.getAccount(bufferToHex(bs58.decode(txMessage.address))).then(
      account => {
        const windowPromise = new WindowPromise();
        windowPromise
          .getResponse(
            this.getUIPath(this.UIRoutes.solSendTransaction.path),
            JSON.stringify({
              ...payload,
              params: [
                payload.method,
                payload.params![0],
                payload.params![1],
                account,
                this.network.name,
              ],
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
