import { EthereumRequest, EthereumResponse } from '@/providers/ethereum/types';
import { EnkryptWindow } from '@/types/globals';
import {
  ProviderInterface,
  ProviderName,
  ProviderOptions,
  ProviderType,
  SendMessageHandler,
} from '@/types/provider';
import EventEmitter from 'eventemitter3';

import { handleIncomingMessage } from './libs/message-handler';
import { MultiversXNetworks } from './types';

export class Provider extends EventEmitter implements ProviderInterface {
  connected: boolean;
  name: ProviderName;
  type: ProviderType;
  version = __VERSION__;
  networks: typeof MultiversXNetworks;
  sendMessageHandler: SendMessageHandler;

  constructor(options: ProviderOptions) {
    super();
    this.connected = true;
    this.name = options.name;
    this.type = options.type;
    this.networks = MultiversXNetworks;
    this.sendMessageHandler = options.sendMessageHandler;
  }

  async request(request: EthereumRequest): Promise<EthereumResponse> {
    const res = (await this.sendMessageHandler(
      this.name,
      JSON.stringify(request),
    )) as EthereumResponse;
    return res;
  }

  isConnected(): boolean {
    return this.connected;
  }

  handleMessage(msg: string): void {
    handleIncomingMessage(this, msg);
  }
}

const injectDocument = (
  document: EnkryptWindow | Window,
  options: ProviderOptions,
): void => {
  const provider = new Provider(options);
  document['enkrypt']['providers'][options.name] = provider;
};

export default injectDocument;
