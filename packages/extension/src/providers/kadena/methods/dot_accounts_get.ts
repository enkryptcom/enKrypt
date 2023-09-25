import { MiddlewareFunction } from "@enkryptcom/types";
import KadenaProvider from "..";
import { ProviderRPCRequest } from "@/types/provider";

const method: MiddlewareFunction = function (
  this: KadenaProvider,
  payload: ProviderRPCRequest,
  res,
  next
): void {
  if (payload.method !== "dot_accounts_get") return next();
  else {
    console.log("Test");
  }
};
export default method;
