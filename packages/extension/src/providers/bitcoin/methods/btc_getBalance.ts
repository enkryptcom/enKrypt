import { MiddlewareFunction } from "@enkryptcom/types";
import { ProviderRPCRequest } from "@/types/provider";
import { getCustomError } from "@/libs/error";
import BitcoinProvider from "..";
const method: MiddlewareFunction = function (
  this: BitcoinProvider,
  payload: ProviderRPCRequest,
  res,
  next
): void {
  if (payload.method !== "btc_getBalance") return next();
  else {
    if (!payload.params || payload.params.length < 1) {
      return res(getCustomError("btc_getBalance: invalid params"));
    }
    this.network.api().then((api) => {
      api.getBalance(payload.params![0]).then((bal) => {
        res(null, bal);
      });
    });
  }
};
export default method;
