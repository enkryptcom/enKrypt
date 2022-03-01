import EventEmitter from "events";
import { RPCRequestType, MiddlewareFunction } from "@enkryptcom/types";

export interface WSQueueType {
  [key: string]: {
    resolve: (a: any) => void;
    request: RPCRequestType;
  };
}

export interface WSOptions {
  headers?: Record<string, string>;
}

export abstract class RequestClass extends EventEmitter {
  url: string;

  middlewares: MiddlewareFunction[];

  constructor(url: string, middlewares: MiddlewareFunction[]) {
    super();
    this.url = url;
    this.middlewares = middlewares;
  }

  abstract changeNetwork(url: string): void;

  abstract request(req: RPCRequestType): Promise<any>;

  abstract disconnect(): void;

  abstract isOpen(): boolean;
}
