import { EthereumNodeType } from "./types";
import getRequestProvider, { RequestClass } from "@enkryptcom/request";
import Networks from "./networks";
import { MiddlewareFunction, OnMessageResponse } from "@enkryptcom/types";
import Middlewares from "./methods";
import EventEmitter from "eventemitter3";
import { ProviderRPCRequest } from "@/types/provider";
class EthereumProvider extends EventEmitter {
  network: EthereumNodeType;
  requestProvider: RequestClass;
  middlewares: MiddlewareFunction[] = [];
  constructor(
    network: EthereumNodeType = Networks.ethereum,
    toWindow: (message: string) => void
  ) {
    super();
    this.network = network;
    this.setMiddleWares();
    this.requestProvider = getRequestProvider(network.node, this.middlewares);
    this.requestProvider.on("notification", (notif: any) => {
      toWindow(JSON.stringify(notif));
    });
  }
  private setMiddleWares(): void {
    this.middlewares = Middlewares.map((mw) => mw.bind(this));
  }
  setRequestProvider(network: EthereumNodeType): void {
    this.network = network;
    this.requestProvider.changeNetwork(network.node);
  }
  request(request: ProviderRPCRequest): Promise<OnMessageResponse> {
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
