import EventEmitter from "eventemitter3";
import { MiddlewareFunction, RPCRequestType } from "@enkryptcom/types";

import * as RPChCrypto from "@rpch/crypto";
// import RPChCrypto from "@rpch/crypto-for-nodejs";
import { RPChEthereumProvider } from "@rpch/ethereum-provider";

import { RequestClass } from "../types";
import MiddleWare from "./middleware";

/**
 * Create a key val store with async methods.
 * Used to mock storage operations.
 */
export const createAsyncKeyValStore = () => {
  const store = new Map<string, string>();

  return {
    async set(k: string, v: string) {
      return store.set(k, v);
    },
    async get(k: string) {
      return store.get(k);
    },
  };
};

class RPChClient extends EventEmitter implements RequestClass {
  url: string;

  middlewares: MiddlewareFunction[];

  middleware: MiddleWare;

  client: any;

  sdkStore = createAsyncKeyValStore();

  _nextId = 1;

  constructor(url: string, middlewares: MiddlewareFunction[] = []) {
    super();
    this.middlewares = middlewares;
    this.middleware = new MiddleWare();
    middlewares.forEach((mw) => this.middleware.use(mw));
    this.url = url;
    console.log(RPChCrypto);

    this.client = new RPChEthereumProvider(
      url,
      {
        timeout: 10000,
        discoveryPlatformApiEndpoint: "http://localhost:3020",
        client: "trial",
        crypto: RPChCrypto,
      },
      (k, v) => this.sdkStore.set(k, v),
      (k) => this.sdkStore.get(k)
    );
    this.client.sdk.debug.enable("rpch*");

    // this.client = new JSONRPCClient((jsonRPCRequest) =>
    //   fetch(this.url, {
    //     method: "POST",
    //     headers: {
    //       "content-type": "application/json",
    //     },
    //     body: JSON.stringify(jsonRPCRequest),
    //   }).then((response) => {
    //     if (response.status === 200) {
    //       return response
    //         .json()
    //         .then((jsonRPCResponse) => this.client.receive(jsonRPCResponse));
    //     }
    //     if (jsonRPCRequest.id !== undefined) {
    //       return Promise.reject(new Error(response.statusText));
    //     }
    //     return Promise.reject(new Error(`unknown error: ${response.status}`));
    //   })
    // );
  }

  changeNetwork(url: string): void {
    this.url = url;
  }

  request(req: RPCRequestType): Promise<any> {
    if (!req.method)
      return Promise.reject(new Error("RPC call must provide a method"));
    console.log("REQUEST RPCH CLIENT", JSON.stringify(req));

    return new Promise((resolve, reject) => {
      const callback = (error, result) => {
        if (error) return reject(error);
        return resolve(result);
      };
      this.middleware
        .run(req, callback)
        .then(() =>
          this.client.request(req.method, req.params).then(resolve, reject)
        );
    });
  }

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  disconnect(): void {}

  isOpen(): boolean {
    return true;
  }
}
export default RPChClient;
