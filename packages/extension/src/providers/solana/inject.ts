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
import { Enkrypt, EnkryptSolAccount } from './libs/wallet-standard/window';
import type { SendOptions } from '@solana/web3.js';
import type { SolanaSignInInput } from '@solana/wallet-standard-features';
import { initialize } from './libs/wallet-standard';
import { SolSignInResponse, SolSignTransactionRequest } from './ui/types';

export class Provider
  extends EventEmitter
  implements ProviderInterface, Enkrypt
{
  connected: boolean;
  name: ProviderName;
  type: ProviderType;
  version: string = __VERSION__;
  autoRefreshOnNetworkChange = false;
  sendMessageHandler: SendMessageHandler;
  accounts: EnkryptSolAccount[];
  constructor(options: ProviderOptions) {
    super();
    this.connected = true;
    this.name = options.name;
    this.type = options.type;
    this.sendMessageHandler = options.sendMessageHandler;
    this.accounts = [];
  }
  connect(
    options?: { onlyIfTrusted?: boolean | undefined } | undefined,
  ): Promise<EnkryptSolAccount[]> {
    return this.request({
      method: 'sol_connect',
      params: [options],
    }).then((res: { address: string; pubkey: string }[]) => {
      this.accounts = res;
      return res;
    });
  }
  disconnect(): Promise<void> {
    this.accounts = [];
    return Promise.resolve();
  }
  signAndSendTransaction(
    transaction: SolSignTransactionRequest,
    options?: SendOptions | undefined,
  ): Promise<string> {
    return this.request({
      method: 'sol_signAndSendTransaction',
      params: [JSON.stringify(transaction), JSON.stringify(options)],
    }).then((res: string) => res);
  }
  signIn(input?: SolanaSignInInput | undefined): Promise<SolSignInResponse> {
    return this.request({
      method: 'sol_signInMessage',
      params: [JSON.stringify(input)],
    }).then((res: SolSignInResponse) => {
      const accExists = this.accounts.find(acc => acc.address === res.address);
      if (!accExists) {
        this.accounts.push({ address: res.address, pubkey: res.pubkey });
      }
      return res;
    });
  }
  signMessage(options: {
    address: string;
    message: string;
  }): Promise<SolSignInResponse> {
    return this.request({
      method: 'sol_signMessage',
      params: [JSON.stringify(options)],
    }).then((res: SolSignInResponse) => res);
  }
  signTransaction(transaction: SolSignTransactionRequest): Promise<string> {
    return this.request({
      method: 'sol_signTransaction',
      params: [JSON.stringify(transaction)],
    }).then((res: string) => res);
  }
  async request(request: EthereumRequest): Promise<any> {
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
  initialize(provider);
  document['enkrypt']['providers'][options.name] = provider;
};
export default injectDocument;
