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
import MassaAPI from './libs/api';
import { TransactionHandler } from './libs/transaction-handler';
import { MessageHandler } from './libs/message-handler';
import {  MassaTransactionOptions } from './types';
import { JsonRPCClient } from '@massalabs/massa-web3/dist/esm/client/jsonRPCClient';
import { RoutesType } from '@/types/ui';

export default class MassaProvider
  extends EventEmitter
  implements BackgroundProviderInterface
{
  private api: MassaAPI;
  private client: JsonRPCClient;
  private transactionHandler: TransactionHandler;
  private messageHandler: MessageHandler;
  requestProvider: RequestClass;
  middlewares: MiddlewareFunction[] = [];
  namespace: string;
  KeyRing: PublicKeyRing;
  UIRoutes: RoutesType;
  toWindow: (message: string) => void;

  constructor(toWindow: (message: string) => void) {
    super();
    this.toWindow = toWindow;
    this.setMiddleWares();
    this.requestProvider = getRequestProvider('', this.middlewares);
    this.requestProvider.on('notification', (notif: any) => {
      this.sendNotification(JSON.stringify(notif));
    });
    this.namespace = ProviderName.massa;
    this.KeyRing = new PublicKeyRing();
    this.api = new MassaAPI('');
    this.client = new JsonRPCClient('');
    this.transactionHandler = new TransactionHandler(this.client);
    this.messageHandler = new MessageHandler(this.client);
    this.UIRoutes = UIRoutes;
  }

  private setMiddleWares(): void {
    this.middlewares = Middlewares(this);
  }

  setRequestProvider(network: BaseNetwork): void {
    this.api = new MassaAPI(network.node);
    this.client = new JsonRPCClient(network.node);
    this.transactionHandler = new TransactionHandler(this.client);
    this.messageHandler = new MessageHandler(this.client);
    this.requestProvider.changeNetwork(network.node);
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

  // Massa-specific methods
  async getBalance(address: string): Promise<string> {
    return this.api.getBalance(address);
  }

  async getTransactionStatus(opId: string): Promise<any> {
    return this.api.getTransactionStatus(opId);
  }

  async createTransaction(
    from: string,
    to: string,
    amount: string,
    options: MassaTransactionOptions = {}
  ): Promise<any> {
    return this.transactionHandler.createTransaction(from, to, amount, options);
  }

  async sendTransaction(
    from: string,
    to: string,
    amount: string,
    options: MassaTransactionOptions = {}
  ): Promise<string> {
    return this.transactionHandler.sendTransaction(from, to, amount, options);
  }

  async getTransactionInfo(opId: string): Promise<any> {
    return this.transactionHandler.getTransactionInfo(opId);
  }

  async estimateFee(): Promise<string> {
    return this.transactionHandler.estimateFee();
  }
}
