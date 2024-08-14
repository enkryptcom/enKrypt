import RPChSDK, { JRPC, type Ops } from "@rpch/sdk";
import { AbstractProvider } from "web3-eth/node_modules/web3-core"; // I had to import from web3-eth dependencies as web3-core has other version
/* eslint-disable */
const RPCH_SECRET_TOKEN = process.env.VUE_APP_RPCH_SECRET_TOKEN;
const DISCOVERY_PLATFORM_API_ENDPOINT = process.env.VUE_APP_DISCOVERY_PLATFORM_API_ENDPOINT;
const FORCE_ZERO_HOP = true; // TODO: Change to false after integration for better privacy

// const singletonInstance = new Singleton();

// Object.freeze(singletonInstance);

export const getSupportedRpchProvider = (
  rpcUrl: string
): string | RPChProvider => {
  if (/^ws(s)?:\/\//i.test(rpcUrl)) {
    return rpcUrl;
  }
  return new RPChProvider(rpcUrl);
};


export class RPChProvider implements AbstractProvider {
  static sdk: RPChSDK;

  static instance(rpcUrl: string) {
    if (RPChProvider.sdk) return  RPChProvider.sdk;

    const ops: Ops = {
      discoveryPlatformEndpoint:
        process.env.VUE_APP_DISCOVERY_PLATFORM_API_ENDPOINT || undefined,
      provider: rpcUrl,
      forceZeroHop: FORCE_ZERO_HOP,
      logLevel: 'verbose'
    };

    // TODO: Remove after confirmation and testing
    console.log("RPCh: CREATING SDK INSTANCE with OPS ", ops);
    console.log("RPCh: Client ID ", process.env.VUE_APP_RPCH_SECRET_TOKEN);

    if (!process.env.VUE_APP_RPCH_SECRET_TOKEN) {
      throw new Error("MISSING RPCH SECRET TOKEN");
    }

    RPChProvider.sdk = new RPChSDK(process.env.VUE_APP_RPCH_SECRET_TOKEN, ops);
    return RPChProvider.sdk;
  }

  constructor(private readonly rpcUrl: string) {
    RPChProvider.instance(rpcUrl); // init the provider right away 
  }

  sendAsync(
    payload: Parameters<AbstractProvider["sendAsync"]>[0],
    callback: Parameters<AbstractProvider["sendAsync"]>[1]
  ) {
    console.log("RPC payload:", payload);
    RPChProvider.instance(this.rpcUrl)
      .send({
        ...payload,
        jsonrpc: "2.0",
      }, {
        provider: this.rpcUrl
      })
      .then(async (res) => {
        const json: JRPC.Response = JSON.parse(res.text);
        console.log("RPCh response:", json);
        const parsedRes = {
          ...json,
          id: json.id ? json.id : 1,
        };
        callback?.(null, parsedRes);
      })
      .catch((err) => {
        callback?.(err as Error);
      });
  }
}
