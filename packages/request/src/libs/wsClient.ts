import { JSONRPCClient } from "json-rpc-2.0";
import EventEmitter from "eventemitter3";
import { v4 as uuidv4 } from "uuid";
import IsomorphicWS from "isomorphic-ws";
import { MiddlewareFunction, RPCRequestType } from "@enkryptcom/types";
import WebSocket from "./reconnectingWS";
import MiddleWare from "./middleware";
import { RequestClass, WSQueueType, WSOptions } from "../types";

class WSClient extends EventEmitter implements RequestClass {
  url: string;

  ws: WebSocket;

  client: JSONRPCClient;

  queue: WSQueueType;

  middleware: MiddleWare;

  middlewares: MiddlewareFunction[];

  wsOptions: WSOptions;

  constructor(
    url: string,
    middlewares: MiddlewareFunction[],
    wsOptions: WSOptions = {}
  ) {
    super();
    this.queue = {};
    this.wsOptions = wsOptions;
    this.changeNetwork(url);
    this.middlewares = middlewares;
    this.middleware = new MiddleWare();
    middlewares.forEach((mw) => this.middleware.use(mw));
    this.client = new JSONRPCClient((request) => {
      try {
        this.ws.send(JSON.stringify(request));
        return Promise.resolve();
      } catch (error) {
        return Promise.reject(error);
      }
    });
  }

  changeNetwork(url: string): void {
    this.url = url;
    this.ws = new WebSocket(this.url, [], {
      WebSocket: IsomorphicWS,
      wsOptions: this.wsOptions,
    });
    this.setListeners();
  }

  setListeners(): void {
    this.ws.onmessage = (event) => {
      const json = JSON.parse(event.data.toString());
      if (json.method && !json.id) {
        this.emit("notification", json);
      } else {
        this.client.receive(json);
      }
    };
    this.ws.onclose = (event) => {
      this.client.rejectAllPendingRequests(
        `Connection is closed (${event.reason}).`
      );
    };
    this.ws.onopen = () => {
      const curQueue = Object.keys(this.queue);
      if (curQueue.length) {
        curQueue.forEach((id) => {
          const item = this.queue[id];
          this.request(item.request).then(item.resolve).catch(item.reject);
          delete this.queue[id];
        });
      }
    };
  }

  request(req: RPCRequestType): Promise<any> {
    if (!req.method)
      return Promise.resolve({
        error: "RPC call must provide a method",
      });

    if (this.isOpen()) {
      return new Promise((resolve, reject) => {
        const callback = (error, result) => {
          if (error) return reject(error);
          return resolve(result);
        };
        this.middleware.run(req, callback).then(() =>
          this.client.request(req.method, req.params).then(
            (res) => {
              resolve(res);
            },
            (error) => {
              reject(error);
            }
          )
        );
      });
    }
    return new Promise((resolve, reject) => {
      this.queue[uuidv4()] = {
        resolve,
        reject,
        request: req,
      };
    });
  }

  isOpen(): boolean {
    return this.ws.readyState === 1;
  }

  disconnect(): void {
    this.ws.close();
  }
}
export default WSClient;
