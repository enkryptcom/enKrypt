import EventEmitter from 'eventemitter3';
import {
  ProviderInterface,
  ProviderName,
  ProviderType,
  ProviderOptions,
  SendMessageHandler,
} from '@/types/provider';
import { EnkryptWindow } from '@/types/globals';
import { InjectedProvider, MassaAccount, MassaTransaction } from './types';
import { SettingsType } from '@/libs/settings-state/types';
import { InternalMethods } from '@/types/messenger';

export class Provider extends EventEmitter implements ProviderInterface, InjectedProvider {
  name: ProviderName;
  type: ProviderType;
  version = __VERSION__;
  connected = false;
  sendMessageHandler: SendMessageHandler;

  constructor(options: ProviderOptions) {
    super();
    this.name = options.name;
    this.type = options.type;
    this.sendMessageHandler = options.sendMessageHandler;
  }

  async request(request: any): Promise<any> {
    const res = await this.sendMessageHandler(
      this.name,
      JSON.stringify(request)
    );
    return res;
  }

  async connect(): Promise<MassaAccount[]> {
    const accounts = await this.request({
      method: 'massa_connect',
    });
    this.connected = true;
    return accounts;
  }

  async disconnect(): Promise<void> {
    await this.request({
      method: 'massa_disconnect',
    });
    this.connected = false;
  }

  async signTransaction(transaction: MassaTransaction): Promise<string> {
    return this.request({
      method: 'massa_signTransaction',
      params: [transaction],
    });
  }

  async signMessage(message: string): Promise<string> {
    return this.request({
      method: 'massa_signMessage',
      params: [message],
    });
  }

  async sendTransaction(transaction: {
    from: string;
    to: string;
    amount: string;
    fee?: string;
    data?: string;
    validityStartPeriod?: number;
  }): Promise<{ operationId: string; status: string; hash: string }> {
    return this.request({
      method: 'massa_sendTransaction',
      params: [transaction],
    });
  }

  async getAccounts(): Promise<string[]> {
    return this.request({
      method: 'massa_getAccounts',
    });
  }

  async getBalance(address: string): Promise<string> {
    return this.request({
      method: 'massa_getBalance',
      params: [address],
    });
  }

  async getNetwork(): Promise<string> {
    return this.request({
      method: 'massa_getNetwork',
    });
  }

  isConnected(): boolean {
    return this.connected;
  }

  handleMessage(msg: string): void {
    const { method, params } = JSON.parse(msg);
    this.emit(method, params);
  }
}

const ProxyHandler = {
  proxymethods: ['request', 'connect', 'disconnect', 'signTransaction', 'signMessage', 'sendTransaction', 'getAccounts', 'getBalance', 'getNetwork'],
  ownKeys(target: Provider) {
    return Object.keys(target).concat(this.proxymethods);
  },
  set(target: Provider, name: keyof Provider, value: any) {
    if (!this.ownKeys(target).includes(name)) this.proxymethods.push(name);
    return Reflect.set(target, name, value);
  },
  getOwnPropertyDescriptor(target: Provider, name: keyof Provider) {
    return {
      value: this.get(target, name),
      configurable: true,
      writable: false,
      enumerable: true,
    };
  },
  get(target: Provider, prop: keyof Provider) {
    if (typeof target[prop] === 'function') {
      return (target[prop] as () => any).bind(target);
    }
    return target[prop];
  },
  has(target: Provider, name: keyof Provider) {
    return this.ownKeys(target).includes(name);
  },
};

const injectDocument = (
  document: EnkryptWindow | Window,
  options: ProviderOptions,
): void => {
  const provider = new Provider(options);
  const proxiedProvider = new Proxy(provider, ProxyHandler);
  document['enkrypt']['providers'][options.name] = provider;
  document['massa'] = proxiedProvider;

  options
    .sendMessageHandler(
      ProviderName.enkrypt,
      JSON.stringify({ method: InternalMethods.getSettings, params: [] }),
    )
    .then((settings: SettingsType) => {
      if (settings.massa?.inject) {
        document['massa'] = proxiedProvider;
      }
    });
};

export default injectDocument; 