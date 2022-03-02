import { EthereumNodeType } from "./types";
import getRequestProvider, { RequestClass } from "@enkryptcom/request";
import Networks from "./networks";
import {
  MiddlewareFunction,
  OnMessageResponse,
  RPCRequestType,
} from "@enkryptcom/types";
import Middlewares from "./methods";
class EthereumProvider {
  network: EthereumNodeType;
  requestProvider: RequestClass;
  middlewares: MiddlewareFunction[] = [];
  constructor(network: EthereumNodeType = Networks.ethereum) {
    this.network = network;
    this.setMiddleWares();
    this.requestProvider = getRequestProvider(network.node, this.middlewares);
  }
  private setMiddleWares(): void {
    this.middlewares = Middlewares.map((mw) => mw.bind(this));
  }
  setRequestProvider(network: EthereumNodeType): void {
    this.network = network;
    this.requestProvider = getRequestProvider(network.node, this.middlewares);
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
export default EthereumProvider;
