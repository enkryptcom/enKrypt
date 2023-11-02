import { MiddlewareFunction } from "@enkryptcom/types";
import SDK from "@rpch/sdk";
import { RequestClass } from "./types";
import WSClient from "./libs/wsClient";
import RPCClient from "./libs/rpcClient";
import NoClient from "./libs/noClient";

export default (
  url: string,
  middlewares: MiddlewareFunction[],
  options?: any
): RequestClass => {
  if (!url) {
    return new NoClient(url, middlewares);
  }
  if (/^http(s)?:\/\//i.test(url)) {
    return new RPCClient(url, middlewares);
  }
  if (/^ws(s)?:\/\//i.test(url)) {
    return new WSClient(url, middlewares, options);
  }
  throw new Error(`Unable to set requrst provider: ${url}`);
};

export { RequestClass };

async function example() {
  // this client secret can be found in your dashboard
  const sdk = new SDK("grind-desire-splurge-draft-acquit", {
    forceZeroHop: true,
    discoveryPlatformEndpoint: "https://discovery.staging.rpch.tech",
  });

  const response = await sdk.send(
    {
      method: "eth_blockNumber",
      params: [],
      jsonrpc: "2.0",
    },
    {
      provider: "https://ethereum-provider.rpch.tech",
    }
  );

  return response;
}

example()
  .then((res) => console.log(res))
  .catch((err) => console.error(err));
