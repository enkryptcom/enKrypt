import EventEmitter from 'eventemitter3';
import { handleIncomingMessage } from './libs/message-router';
import { EthereumRequest, EthereumResponse } from '@/providers/ethereum/types';
import {
  ProviderName,
  ProviderOptions,
  ProviderType,
  ProviderInterface,
  SendMessageHandler,
} from '@/types/provider';
import { EnkryptWindow } from '@/types/globals';
import { BitcoinNetworks } from './types';
import { InternalMethods } from '@/types/messenger';
import { SettingsType } from '@/libs/settings-state/types';

export class Provider extends EventEmitter implements ProviderInterface {
  connected: boolean;
  name: ProviderName;
  type: ProviderType;
  version: string = __VERSION__;
  autoRefreshOnNetworkChange = false;
  networks: typeof BitcoinNetworks;
  sendMessageHandler: SendMessageHandler;
  constructor(options: ProviderOptions) {
    super();
    this.connected = true;
    this.name = options.name;
    this.type = options.type;
    this.networks = BitcoinNetworks;
    this.sendMessageHandler = options.sendMessageHandler;
  }

  async request(request: EthereumRequest): Promise<EthereumResponse> {
    const res = (await this.sendMessageHandler(
      this.name,
      JSON.stringify(request),
    )) as EthereumResponse;
    return res;
  }

  requestAccounts = async () => {
    return this.request({
      method: 'btc_requestAccounts',
    });
  };

  getAccounts = async () => {
    return this.request({
      method: 'btc_requestAccounts',
    });
  };

  getPublicKey = async () => {
    return this.request({
      method: 'btc_getPublicKey',
    });
  };

  getNetwork = async () => {
    return this.request({
      method: 'btc_getNetwork',
    });
  };

  switchNetwork = async (network: string) => {
    return this.request({
      method: 'btc_switchNetwork',
      params: [network],
    });
  };

  getBalance = async () => {
    return this.request({
      method: 'btc_getBalance',
    });
  };

  signPsbt = async (psbtHex: string, options?: any) => {
    return this.request({
      method: 'btc_signPsbt',
      params: [psbtHex, options],
    });
  };

  signMessage = async (text: string, type: string) => {
    return this.request({
      method: 'btc_signMessage',
      params: [text, type],
    });
  };

  getInscriptions = async () => {
    return Promise.reject('not implemented');
  };

  sendBitcoin = async () => {
    return Promise.reject('not implemented');
  };

  sendInscription = async () => {
    return Promise.reject('not implemented');
  };

  inscribeTransfer = async () => {
    return Promise.reject('not implemented');
  };

  pushTx = async () => {
    return Promise.reject('not implemented');
  };

  signPsbts = async () => {
    return Promise.reject('not implemented');
  };

  pushPsbt = async () => {
    return Promise.reject('not implemented');
  };

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
  options
    .sendMessageHandler(
      ProviderName.enkrypt,
      JSON.stringify({ method: InternalMethods.getSettings, params: [] }),
    )
    .then((settings: SettingsType) => {
      if (settings.btc.injectUnisat)
        (document as EnkryptWindow)['unisat'] = provider;
    });
  (document as EnkryptWindow)['enkrypt']['providers'][options.name] = provider;
};
export default injectDocument;
