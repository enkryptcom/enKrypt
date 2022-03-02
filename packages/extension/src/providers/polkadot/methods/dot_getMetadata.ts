import { MiddlewareFunction } from "@enkryptcom/types";
import EthereumProvider from "..";
const method: MiddlewareFunction = function (
  this: EthereumProvider,
  payload,
  res,
  next
): void {
  if (payload.method !== "dot_getMetadata") return next();
  else {
    return res(null, [
      {
        genesisHash:
          "0xfc41b9bd8ef8fe53d58c7ea67c794c7ec9a73daf05e6d54b14ff6342c99ba64c",
        specVersion: 2034,
      },
    ]);
  }
};
export default method;
