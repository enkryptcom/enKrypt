import { BaseNetwork } from '@/types/base-network';
import getRequestProvider, { RequestClass } from '@enkryptcom/request';
import { MiddlewareFunction, OnMessageResponse } from '@enkryptcom/types';
import Middlewares from './methods';
import EventEmitter from 'eventemitter3';
import {
  BackgroundProviderInterface,
  ProviderName,
  ProviderRPCRequest,
} from '@/types/provider';
import GetUIPath from '@/libs/utils/get-ui-path';
import PublicKeyRing from '@/libs/keyring/public-keyring';
import UIRoutes from './ui/routes/names';
import { RoutesType } from '@/types/ui';
import massaNetworks from './networks';
import { NetworkNames } from '@enkryptcom/types';

export default class MassaProvider
  extends EventEmitter
  implements BackgroundProviderInterface
{
  public network: BaseNetwork;
  requestProvider: RequestClass;
  middlewares: MiddlewareFunction[] = [];
  namespace: string;
  KeyRing: PublicKeyRing;
  UIRoutes: RoutesType;
  toWindow: (message: string) => void;

  constructor(
    toWindow: (message: string) => void,
    network: BaseNetwork = massaNetworks[NetworkNames.Massa],
  ) {
    super();
    this.network = network;
    this.toWindow = toWindow;
    this.setMiddleWares();
    this.requestProvider = getRequestProvider('', this.middlewares);
    this.requestProvider.on('notification', (notif: any) => {
      this.sendNotification(JSON.stringify(notif));
    });
    this.namespace = ProviderName.massa;
    this.KeyRing = new PublicKeyRing();

    this.UIRoutes = UIRoutes;
  }

  private setMiddleWares(): void {
    this.middlewares = Middlewares(this).map(mw => mw.bind(this));
  }

  setRequestProvider(network: BaseNetwork): void {
    const prevURL = new URL(this.network.node);
    const newURL = new URL(network.node);
    this.network = network;
    if (prevURL.protocol === newURL.protocol)
      this.requestProvider.changeNetwork(network.node);
    else
      this.requestProvider = getRequestProvider(network.node, this.middlewares);
  }

  async isPersistentEvent(): Promise<boolean> {
    return false;
  }

  async sendNotification(notif: string): Promise<void> {
    return this.toWindow(notif);
  }

  request(request: ProviderRPCRequest): Promise<OnMessageResponse> {
    return this.requestProvider
      .request(request)
      .then(res => {
        return {
          result: JSON.stringify(res),
        };
      })
      .catch(e => {
        return {
          error: JSON.stringify(e.message),
        };
      });
  }

  getUIPath(page: string): string {
    return GetUIPath(page, this.namespace);
  }

  getCurrentNetwork(): BaseNetwork {
    return this.network;
  }
}
