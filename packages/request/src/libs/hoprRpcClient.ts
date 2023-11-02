import RPChSDK, { type Ops } from "@rpch/sdk";
import { JSONRPCParams } from "json-rpc-2.0";

export class HoprRpcClient {
  sdk: RPChSDK;

  constructor(provider: string) {
    const ops: Ops = {
      discoveryPlatformEndpoint: process.env.DISCOVERY_PLATFORM_API_ENDPOINT,
      timeout: process.env.RESPONSE_TIMEOUT
        ? parseInt(process.env.RESPONSE_TIMEOUT, 10)
        : undefined,
      forceZeroHop: true,
      provider,
    };

    // TODO: Remove after confirmation and testing
    console.log("RPCh: CREATING SDK INSTANCE with OPS ", ops);

    console.log("RPCh: Client ID ", process.env.HOPR_CLIENT);

    this.sdk = new RPChSDK(process.env.HOPR_CLIENT, ops);
  }

  request(method: string, params: JSONRPCParams): Promise<unknown> {
    // TODO: Remove after confirmation and testing
    console.log(
      "RPCh: SENDING REQUEST to: ",
      (this.sdk as any & RPChSDK).ops.provider
    );
    console.log("RPCh: SENDING REQUEST method: ", method, " params: ", params);
    return this.sdk.send({
      jsonrpc: "2.0",
      method,
      params,
    });
  }
}
