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
  if (payload.method !== "eth_decrypt") return next();
  else {
    if (!payload.params || payload.params.length < 2) {
      return res(getCustomError("eth_decrypt: invalid params"));
    }
    const message = payload.params[0];
    this.KeyRing.getAccount(payload.params[1].toLowerCase()).then((account) => {
      const windowPromise = new WindowPromise();
      windowPromise
        .getResponse(
          this.getUIPath(this.UIRoutes.ethDecrypt.path),
          JSON.stringify({
            ...payload,
            params: [message, account, this.network.name],
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
