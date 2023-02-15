import { getCustomError } from "@/libs/error";
import { MiddlewareFunction } from "@enkryptcom/types";
import EthereumProvider from "..";
import { WindowPromise } from "@/libs/window-promise";
import { isHexStrict, utf8ToHex } from "web3-utils";
const method: MiddlewareFunction = function (
  this: EthereumProvider,
  payload,
  res,
  next
): void {
  if (payload.method !== "personal_sign") return next();
  else {
    if (!payload.params || payload.params.length < 2) {
      return res(getCustomError("personal_sign: invalid params"));
    }
    let msg = payload.params[0];
    let address = payload.params[1].toLowerCase();
    if (
      this.network.isAddress(msg.toLowerCase()) &&
      !this.network.isAddress(address.toLowerCase())
    ) {
      msg = payload.params[1];
      address = payload.params[0].toLowerCase();
    }
    if (!isHexStrict(msg)) msg = utf8ToHex(msg);
    this.KeyRing.getAccount(address).then((account) => {
      const windowPromise = new WindowPromise();
      windowPromise
        .getResponse(
          this.getUIPath(this.UIRoutes.ethSign.path),
          JSON.stringify({
            ...payload,
            params: [msg, account, this.network.name],
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
