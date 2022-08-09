import { MiddlewareFunction } from "@enkryptcom/types";
import SubstrateProvider from "..";
import { ProviderRPCRequest } from "@/types/provider";
import { getCustomError } from "@/libs/error";
const method: MiddlewareFunction = function (
  this: SubstrateProvider,
  payload: ProviderRPCRequest,
  res,
  next
): void {
  if (payload.method !== "dot_signer_signPayload") return next();
  else {
    res(getCustomError("Not Implemented"));
  }
};
export default method;
