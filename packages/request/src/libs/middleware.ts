import {
  MiddlewareFunction,
  RPCRequestType,
  CallbackFunction,
} from "@enkryptcom/types";

class Middleware {
  middlewares: MiddlewareFunction[];

  constructor(middlewares: MiddlewareFunction[] = []) {
    this.middlewares = middlewares;
  }

  use(fn: MiddlewareFunction): void {
    this.middlewares.push(fn);
  }

  executeMiddleware(req: RPCRequestType, res: CallbackFunction, done): void {
    this.middlewares.reduceRight(
      (_done, next) => () => next(req, res, _done),
      done
    )(req, res);
  }

  run(req: RPCRequestType, res: CallbackFunction): Promise<any> {
    return new Promise((resolve) => {
      this.executeMiddleware(req, res, resolve);
    });
  }
}

export default Middleware;
