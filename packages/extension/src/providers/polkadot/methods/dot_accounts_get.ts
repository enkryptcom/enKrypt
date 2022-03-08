import { MiddlewareFunction } from "@enkryptcom/types";
import EthereumProvider from "..";
import { WindowPromise } from "@/libs/window-promise";
const method: MiddlewareFunction = function (
  this: EthereumProvider,
  payload,
  res,
  next
): void {
  if (payload.method !== "dot_accounts_get") return next();
  else {
    const windowPromise = new WindowPromise();
    windowPromise
      .getResponse(
        this.getUIPath(this.UIRoutes.dotAccounts.path),
        JSON.stringify(payload)
      )
      .then(({ error, result }) => {
        if (error) res(error);
        res(null, JSON.parse(result || "[]"));
      });
  }
};
export default method;
