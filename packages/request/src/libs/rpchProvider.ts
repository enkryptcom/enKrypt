import RPChSDK, { JRPC, type Ops } from "@rpch/sdk";
import { JSONRPCParams } from "json-rpc-2.0";
import { v4 as uuidv4 } from "uuid";

const RPCH_SECRET_TOKEN = process.env.RPCH_SECRET_TOKEN;
const DISCOVERY_PLATFORM_API_ENDPOINT =
  process.env.DISCOVERY_PLATFORM_API_ENDPOINT;
const FORCE_ZERO_HOP = true; // TODO: Change to false after integration for better privacy

class RPChSDKSingleton {
  static sdk: RPChSDK | undefined;

  static options: Ops = {
    discoveryPlatformEndpoint: DISCOVERY_PLATFORM_API_ENDPOINT || undefined,
    forceZeroHop: FORCE_ZERO_HOP,
  };

  static send(
    ...args: Parameters<RPChSDK["send"]>
  ): ReturnType<RPChSDK["send"]> {
    if (!this.sdk) {
      // TODO: Remove after integration, confirmation and testing
      console.log(
        "RPCh: CREATING SDK INSTANCE with OPS ",
        RPChSDKSingleton.options
      );
      console.log("RPCh: Client ID ", RPCH_SECRET_TOKEN);

      if (!RPCH_SECRET_TOKEN) {
        console.error("MISSING RPCH SECRET TOKEN");
        throw new Error("MISSING RPCH SECRET TOKEN");
      }

      console.info("RPCh: first SEND request, creating SDK instance");
      this.sdk = new RPChSDK(RPCH_SECRET_TOKEN, this.options);
    }
    return this.sdk.send(...args);
  }
}

export class RPChProvider {
  rpcUrl: string;

  constructor(rpcUrl: string) {
    this.rpcUrl = rpcUrl;
  }

  request(method: string, params: JSONRPCParams): Promise<unknown> {
    // TODO: Remove after integration, confirmation and testing
    console.log("RPCh: SENDING REQUEST to: ", this.rpcUrl);
    console.log("RPCh: SENDING REQUEST method: ", method, " params: ", params);

    return RPChSDKSingleton.send(
      {
        jsonrpc: "2.0",
        method,
        params,
        id: uuidv4(),
      },
      { provider: this.rpcUrl }
    )
      .then(async (res) => {
        const json: JRPC.Response = JSON.parse(res.text);
        console.log("RPCh response:", json);
        return json;
      })
      .then(({ result }: JRPC.Result) => result);
  }
}
