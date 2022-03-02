import EventEmitter from "eventemitter3";
import { JSONRPCClient } from "json-rpc-2.0";
import fetch from "node-fetch";
import { MiddlewareFunction, RPCRequestType } from "@enkryptcom/types";
import { RequestClass } from "../types";
import MiddleWare from "./middleware";

class RPCClient extends EventEmitter implements RequestClass {
  url: string;

  middlewares: MiddlewareFunction[];

  middleware: MiddleWare;

  client: JSONRPCClient;

  constructor(url: string, middlewares: MiddlewareFunction[] = []) {
    super();
    this.middlewares = middlewares;
    this.middleware = new MiddleWare();
    middlewares.forEach((mw) => this.middleware.use(mw));
    this.url = url;
    this.client = new JSONRPCClient((jsonRPCRequest) =>
      fetch(this.url, {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify(jsonRPCRequest),
      }).then((response) => {
        if (response.status === 200) {
          return response
            .json()
            .then((jsonRPCResponse) => this.client.receive(jsonRPCResponse));
        }
        if (jsonRPCRequest.id !== undefined) {
          return Promise.reject(new Error(response.statusText));
        }
        return Promise.reject(new Error(`unknown error: ${response.status}`));
      })
    );
  }

  changeNetwork(url: string): void {
    this.url = url;
  }

  request(req: RPCRequestType): Promise<any> {
    if (!req.method)
      return Promise.reject(new Error("RPC call must provide a method"));

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
export default RPCClient;
