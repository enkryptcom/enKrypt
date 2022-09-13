import { getCustomError } from "@/libs/error";
import { MiddlewareFunction } from "@enkryptcom/types";
import EthereumProvider from "..";
const method: MiddlewareFunction = function (
  this: EthereumProvider,
  payload,
  res,
  next
): void {
  if (payload.method !== "wallet_requestPermissions") return next();
  else {
    if (!payload.params || payload.params.length < 1) {
      return res(getCustomError("wallet_requestPermissions: invalid params"));
    }
    const fauxPermissions = Object.keys(payload.params[0]).map((reqName) => {
      return {
        parentCapability: reqName,
      };
    });
    res(null, fauxPermissions);
  }
};
export default method;
