import { MiddlewareFunction } from "@enkryptcom/types";
import { ProviderRPCRequest } from "@/types/provider";
import { getCustomError } from "@/libs/error";

const method: MiddlewareFunction = function (
  this: any,
  payload: ProviderRPCRequest,
  res,
  next
): void {
  if (payload.method !== "dot_accounts_get") return next();
  else {
    res(getCustomError("Not Implemented"));
  }
};
export default method;
