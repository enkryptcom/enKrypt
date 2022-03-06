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
    const windowPromise = new WindowPromise();
    windowPromise
      .getResponse("index.html#/ethereum/ethaccounts", JSON.stringify(payload))
      .then(({ error, result }) => {
        console.log(error, result);
        if (error) res(error as any);
        res(null, JSON.parse(result || "[]"));
      });
  }
};
export default method;
