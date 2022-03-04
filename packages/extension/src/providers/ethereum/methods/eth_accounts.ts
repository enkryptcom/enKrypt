import type { MiddlewareFunction } from "@enkryptcom/types";
import type EthereumProvider from "..";
import WindowPromise from "@/libs/window-promise";
import { ProviderRPCRequest } from "@/types/provider";
const method: MiddlewareFunction = function (
  this: EthereumProvider,
  payload: ProviderRPCRequest,
  res,
  next
): void {
  if (
    payload.method !== "eth_accounts" &&
    payload.method !== "eth_requestAccounts"
  )
    return next();
  else {
    console.log(payload.options);
    const windowPromise = new WindowPromise();
    windowPromise.getResponse("extension.html").then(({ error, result }) => {
      if (error) res(JSON.parse(error));
      res(null, JSON.parse(result || "[]"));
    });
  }
};
export default method;
