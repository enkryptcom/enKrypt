import { MiddlewareFunction } from "@enkryptcom/types";
import EthereumProvider from "..";
const method: MiddlewareFunction = function (
  this: EthereumProvider,
  payload,
  res,
  next
): void {
  if (
    payload.method !== "eth_accounts" &&
    payload.method !== "eth_requestAccounts"
  )
    return next();
  else {
    return res(null, ["0xe5DC07BdCDB8C98850050C7f67De7E164b1eA391"]);
  }
};
export default method;
