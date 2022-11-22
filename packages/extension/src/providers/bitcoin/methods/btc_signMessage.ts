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
  if (payload.method !== "btc_signMessage") return next();
  else {
    if (!payload.params || payload.params.length < 2) {
      return res(getCustomError("btc_signMessage: invalid params"));
    }
    const msg = payload.params[0];
    this.KeyRing.getAccounts(this.network.signer).then((accounts) => {
      const acc = accounts.find(
        (a) => this.network.displayAddress(a.address) === payload.params![1]
      );
      if (!acc)
        return res(getCustomError("btc_signMessage: account not found"));
      const windowPromise = new WindowPromise();
      windowPromise
        .getResponse(
          this.getUIPath(this.UIRoutes.btcSign.path),
          JSON.stringify({
            ...payload,
            params: [msg, acc, this.network.name],
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
