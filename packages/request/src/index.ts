import { MiddlewareFunction } from "@enkryptcom/types";
import { RequestClass } from "./types";
import WSClient from "./libs/wsClient";
import RPCClient from "./libs/rpcClient";

export default (
  url: string,
  middlewares: MiddlewareFunction[],
  options?: any
): RequestClass => {
  if (/^http(s)?:\/\//i.test(url)) {
    return new RPCClient(url, middlewares);
  }
  if (/^ws(s)?:\/\//i.test(url)) {
    return new WSClient(url, middlewares, options);
  }
  throw new Error(`Unable to set requrst provider: ${url}`);
};

export { RequestClass };
