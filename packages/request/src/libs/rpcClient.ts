import EventEmitter from "eventemitter3";
import { MiddlewareFunction, RPCRequestType } from "@enkryptcom/types";
import { RequestClass } from "../types";
import MiddleWare from "./middleware";
import { RPChProvider } from "@src/libs/rpchProvider";

class RPCClient extends EventEmitter implements RequestClass {
  url: string;

  middlewares: MiddlewareFunction[];

  middleware: MiddleWare;

  client: RPChProvider;

  constructor(url: string, middlewares: MiddlewareFunction[] = []) {
    super();
    this.middlewares = middlewares;
    this.middleware = new MiddleWare();
    middlewares.forEach((mw) => this.middleware.use(mw));
    this.url = url;
    this.client = new RPChProvider(url);
  }

  changeNetwork(url: string): void {
    this.url = url;
    this.client = new RPChProvider(url);
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
