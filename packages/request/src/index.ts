import { MiddlewareFunction } from "@enkryptcom/types";
import { RequestClass } from "./types";
import WSClient from "./libs/wsClient";
import RPCClient from "./libs/rpcClient";
import NoClient from "./libs/noClient";
import RPChClient from "./libs/rpchClient";

export default (
  url: string,
  middlewares: MiddlewareFunction[],
  options?: any
): RequestClass => {
  console.log("URL", url);
  console.log("MIDDLEWARE:", JSON.stringify(middlewares));
  console.log("OPTIONS", options);
  if (!url) {
    return new NoClient(url, middlewares);
  }
  if (/^http(s)?:\/\//i.test(url)) {
    console.log(url);
    console.log(middlewares);
    console.log(options);
    if (url === "https://primary.gnosis-chain.rpc.hoprtech.net") {
      console.log("RPCh Client:", url);
      return new RPChClient(url, middlewares);
    }
    console.log("Normal RPC client");
    return new RPCClient(url, middlewares);
  }
  if (/^ws(s)?:\/\//i.test(url)) {
    return new WSClient(url, middlewares, options);
  }
  throw new Error(`Unable to set requrst provider: ${url}`);
};

export { RequestClass };
