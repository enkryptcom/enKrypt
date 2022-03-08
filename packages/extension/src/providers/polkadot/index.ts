import getRequestProvider, { RequestClass } from "@enkryptcom/request";
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
class PolkadotProvider
  extends EventEmitter
  implements BackgroundProviderInterface
{
  requestProvider: RequestClass;
  middlewares: MiddlewareFunction[] = [];
  namespace: string;
  KeyRing: PublicKeyRing;
  UIRoutes = UIRoutes;
  constructor(toWindow: (message: string) => void) {
    super();
    this.setMiddleWares();
    this.requestProvider = getRequestProvider("", this.middlewares);
    this.requestProvider.on("notification", (notif: any) => {
      toWindow(JSON.stringify(notif));
    });
    this.namespace = ProviderName.polkadot;
    this.KeyRing = new PublicKeyRing();
  }
  private setMiddleWares(): void {
    this.middlewares = Middlewares.map((mw) => mw.bind(this));
  }
  setRequestProvider(url: string): void {
    this.requestProvider.changeNetwork(url);
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
export default PolkadotProvider;
