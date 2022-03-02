import getRequestProvider, { RequestClass } from "@enkryptcom/request";
import {
  MiddlewareFunction,
  OnMessageResponse,
  RPCRequestType,
} from "@enkryptcom/types";
import Middlewares from "./methods";
import EventEmitter from "eventemitter3";
class PolkadotProvider extends EventEmitter {
  requestProvider: RequestClass;
  middlewares: MiddlewareFunction[] = [];
  constructor(_rand: unknown, toWindow: (message: string) => void) {
    super();
    this.setMiddleWares();
    this.requestProvider = getRequestProvider(
      "wss://rpc.polkadot.io/",
      this.middlewares
    );
    this.requestProvider.on("notification", (notif: any) => {
      toWindow(JSON.stringify(notif));
    });
  }
  private setMiddleWares(): void {
    this.middlewares = Middlewares.map((mw) => mw.bind(this));
  }
  setRequestProvider(url: string): void {
    this.requestProvider.changeNetwork(url);
  }
  request(request: RPCRequestType): Promise<OnMessageResponse> {
    return this.requestProvider
      .request(request)
      .then((res) => {
        return {
          result: JSON.stringify(res),
        };
      })
      .catch((e) => {
        return {
          error: JSON.stringify(e.message),
        };
      });
  }
}
export default PolkadotProvider;
