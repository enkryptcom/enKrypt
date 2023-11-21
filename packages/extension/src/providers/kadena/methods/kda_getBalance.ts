import { MiddlewareFunction } from "@enkryptcom/types";
import KadenaProvider from "..";
import { ProviderRPCRequest } from "@/types/provider";
import { getCustomError } from "@/libs/error";

const method: MiddlewareFunction = function (
  this: KadenaProvider,
  payload: ProviderRPCRequest,
  res,
  next
): void {
  if (payload.method !== "kda_getBalance") return next();
  else {
    if (!payload.params || payload.params.length < 1) {
      return res(getCustomError("kda_getBalance: invalid params"));
    }

    const address = payload.params[0];
    const chainId =
      payload.params[1] ?? this.network.options.kadenaApiOptions.chainId;
    this.network.api().then((api) => {
      api.getBalance(address, chainId).then((bal) => {
        res(null, bal);
      });
    });
  }
};
export default method;
