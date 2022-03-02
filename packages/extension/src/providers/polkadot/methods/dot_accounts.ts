import { MiddlewareFunction } from "@enkryptcom/types";
import EthereumProvider from "..";
const method: MiddlewareFunction = function (
  this: EthereumProvider,
  payload,
  res,
  next
): void {
  if (payload.method !== "dot_accounts") return next();
  else {
    return res(null, [
      {
        address: "5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY",
        genesisHash: "",
        name: "abcd",
        type: "sr25519",
      },
    ]);
  }
};
export default method;
