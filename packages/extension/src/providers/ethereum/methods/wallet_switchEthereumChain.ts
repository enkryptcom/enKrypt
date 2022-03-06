import { getCustomError } from "@/libs/error";
import { MiddlewareFunction } from "@enkryptcom/types";
import EthereumProvider from "..";
const method: MiddlewareFunction = function (
  this: EthereumProvider,
  payload,
  res,
  next
): void {
  if (payload.method !== "wallet_switchEthereumChain") return next();
  else return res(getCustomError("Not implemented"));
};
export default method;
