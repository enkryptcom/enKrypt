import EventEmitter from "events";

export interface RPCRequestType {
  method: string;
  params?: Array<any>;
}

export interface RPCResponseType {
  result?: any;
  error?: any;
}

export interface WSQueueType {
  [key: string]: {
    resolve: (a: any) => void;
    request: RPCRequestType;
  };
}
export type CallbackFunction = (err: Error, result: any) => void;
export type NextFunction = () => void;
export type MiddlewareFunction = (
  payload: RPCRequestType,
  response: CallbackFunction,
  next: NextFunction
) => void;

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
