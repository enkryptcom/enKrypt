import PublicKeyRing from '@/libs/keyring/public-keyring';

import getUiPath from '@/libs/utils/get-ui-path';
import {
  BackgroundProviderInterface,
  ProviderName,
  ProviderRPCRequest,
} from '@/types/provider';
import getRequestProvider from '@enkryptcom/request';
import { MiddlewareFunction, OnMessageResponse } from '@enkryptcom/types';
import EventEmitter from 'events';
import Middlewares from './methods';
import Networks from './networks/index';
import { MultiversXNetwork } from './types/mvx-network';
import UIRoutes from './ui/routes/names';

class MultiversXProvider
  extends EventEmitter
  implements BackgroundProviderInterface
{
  override listeners(event: string | symbol): ((...args: any[]) => void)[] {
    // Cast each Function to the expected type
    return super.listeners(event) as ((...args: any[]) => void)[];
  }

  UIRoutes = UIRoutes;
  toWindow: (message: string) => void;
  network: MultiversXNetwork;
  requestProvider: any;
  middlewares: MiddlewareFunction[] = [];
  namespace: ProviderName;
  KeyRing: PublicKeyRing;

  constructor(
    toWindow: (message: string) => void,
    network: MultiversXNetwork = Networks.multiversx,
  ) {
    super();
    this.network = network;
    this.toWindow = toWindow;
    this.setMiddleWares();
    this.requestProvider = getRequestProvider('', this.middlewares);
    this.requestProvider.on('notification', (notif: any) => {
      this.sendNotification(JSON.stringify(notif));
    });
    this.namespace = ProviderName.multiversx;
    this.KeyRing = new PublicKeyRing();
  }

  private setMiddleWares(): void {
    this.middlewares = Middlewares.map(mw => mw.bind(this));
  }

  setRequestProvider(network: MultiversXNetwork): void {
    this.network = network;
    this.requestProvider.changeNetwork(network.node);
  }

  request(request: ProviderRPCRequest): Promise<OnMessageResponse> {
    return this.requestProvider
      .request(request)
      .then((res: any) => ({
        result: JSON.stringify(res),
      }))
      .catch((e: { message: any }) => ({
        error: JSON.stringify(e.message),
      }));
  }

  async sendNotification(notif: string): Promise<void> {
    return this.toWindow(notif);
  }

  async isPersistentEvent(): Promise<boolean> {
    return false;
  }

  getUIPath(page: string): string {
    return getUiPath(page, this.namespace);
  }
}

export default MultiversXProvider;
