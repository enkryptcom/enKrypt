import { getCustomError } from "@/libs/error";
import { MiddlewareFunction } from "@enkryptcom/types";
import EthereumProvider from "..";
import { WindowPromise } from "@/libs/window-promise";
const method: MiddlewareFunction = function (
  this: EthereumProvider,
  payload,
  res,
  next
): void {
  if (payload.method !== "eth_getEncryptionPublicKey") return next();
  else {
    if (!payload.params || payload.params.length < 1) {
      return res(getCustomError("eth_getEncryptionPublicKey: invalid params"));
    }
    this.KeyRing.getAccount(payload.params[0].toLowerCase()).then((account) => {
      const windowPromise = new WindowPromise();
      windowPromise
        .getResponse(
          this.getUIPath(this.UIRoutes.ethGetEncryptionKey.path),
          JSON.stringify({
            ...payload,
            params: [account, this.network.name],
          }),
          true
        )
        .then(({ error, result }) => {
          if (error) return res(error);
          res(null, JSON.parse(result as string));
        });
    });
  }
};
export default method;
