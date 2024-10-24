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

import Networks from './networks';
import { BaseNetwork } from '@/types/base-network';
import { KadenaNetwork } from './types/kadena-network';

class KadenaProvider
  extends EventEmitter
  implements BackgroundProviderInterface
{
  network: KadenaNetwork;
  requestProvider: RequestClass;
  middlewares: MiddlewareFunction[] = [];
  namespace: string;
  KeyRing: PublicKeyRing;
  UIRoutes = UIRoutes;
  toWindow: (message: string) => void;

  constructor(
    toWindow: (message: string) => void,
    network: KadenaNetwork = Networks.kadena,
  ) {
    super();
    this.network = network;
    this.toWindow = toWindow;
    this.setMiddleWares();
    this.requestProvider = getRequestProvider('', this.middlewares);
    this.requestProvider.on('notification', (notif: any) => {
      this.sendNotification(JSON.stringify(notif));
    });
    this.namespace = ProviderName.kadena;
    this.KeyRing = new PublicKeyRing();
  }

  private setMiddleWares(): void {
    this.middlewares = Middlewares.map(mw => mw.bind(this));
  }

  setRequestProvider(network: BaseNetwork): void {
    this.network = network as KadenaNetwork;
    this.requestProvider.changeNetwork(network.node);
  }

  request(request: ProviderRPCRequest): Promise<OnMessageResponse> {
    return this.requestProvider
      .request(request)
      .then((res: any) => {
        return {
          result: JSON.stringify(res),
        };
      })
      .catch((e: { message: any }) => {
        return {
          error: JSON.stringify(e.message),
        };
      });
  }

  async sendNotification(notif: string): Promise<void> {
    return this.toWindow(notif);
  }

  async isPersistentEvent(): Promise<boolean> {
    return false;
  }

  getUIPath(page: string): string {
    return GetUIPath(page, this.namespace);
  }
}

export default KadenaProvider;
