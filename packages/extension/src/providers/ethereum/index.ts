import { EthereumNodeType } from "./types";
import getRequestProvider, { RequestClass } from "@enkryptcom/request";
import Networks from "./networks";
import { MiddlewareFunction, OnMessageResponse } from "@enkryptcom/types";
import Middlewares from "./methods";
import EventEmitter from "eventemitter3";
import {
  BackgroundProviderInterface,
  ProviderName,
  ProviderRPCRequest,
} from "@/types/provider";
import GetUIPath from "@/libs/utils/get-ui-path";
import PublicKeyRing from "@/libs/keyring/public-keyring";
import { routes as UIRoutes } from "./ui/routes";
class EthereumProvider
  extends EventEmitter
  implements BackgroundProviderInterface
{
  network: EthereumNodeType;
  requestProvider: RequestClass;
  middlewares: MiddlewareFunction[] = [];
  namespace: string;
  KeyRing: PublicKeyRing;
  UIRoutes = UIRoutes;
  toWindow: (message: string) => void;
  constructor(
    toWindow: (message: string) => void,
    network: EthereumNodeType = Networks.ethereum
  ) {
    super();
    this.network = network;
    this.toWindow = toWindow;
    this.setMiddleWares();
    this.requestProvider = getRequestProvider(network.node, this.middlewares);
    this.requestProvider.on("notification", (notif: any) => {
      this.sendNotification(JSON.stringify(notif));
    });
    this.namespace = ProviderName.ethereum;
    this.KeyRing = new PublicKeyRing();
  }
  private setMiddleWares(): void {
    this.middlewares = Middlewares.map((mw) => mw.bind(this));
  }
  setRequestProvider(network: EthereumNodeType): void {
    this.network = network;
    this.requestProvider.changeNetwork(network.node);
  }
  async isPersistentEvent(request: ProviderRPCRequest): Promise<boolean> {
    if (request.method === "eth_subscribe") return true;
    return false;
  }
  async sendNotification(notif: string): Promise<void> {
    return this.toWindow(notif);
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
  getUIPath(page: string): string {
    return GetUIPath(page, this.namespace);
  }
}
export default EthereumProvider;
