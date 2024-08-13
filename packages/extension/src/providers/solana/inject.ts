import EventEmitter from "eventemitter3";
import { handleIncomingMessage } from "./libs/message-router";
import { EthereumRequest, EthereumResponse } from "@/providers/ethereum/types";
import {
  ProviderName,
  ProviderOptions,
  ProviderType,
  ProviderInterface,
  SendMessageHandler,
} from "@/types/provider";
import { EnkryptWindow } from "@/types/globals";
import { InternalMethods } from "@/types/messenger";
import { SettingsType } from "@/libs/settings-state/types";
import { Enkrypt, EnkryptSolAccount } from "./libs/wallet-standard/window";
import type {
  PublicKey,
  SendOptions,
  Transaction,
  VersionedTransaction,
} from "@solana/web3.js";
import type {
  SolanaSignInInput,
  SolanaSignInOutput,
} from "@solana/wallet-standard-features";
import { initialize } from "./libs/wallet-standard";
import { EnkryptWalletAccount } from "./libs/wallet-standard/account";
import { SolSignInResponse, SolSignTransactionRequest } from "./ui/types";

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
    options?: { onlyIfTrusted?: boolean | undefined } | undefined
  ): Promise<EnkryptSolAccount[]> {
    return this.request({
      method: "sol_connect",
      params: [options],
    }).then((res: { address: string; pubkey: string }[]) => {
      this.accounts = res;
      return res;
    });
  }
  disconnect(): Promise<void> {
    console.log("disconnect");
    return Promise.reject("not implemented");
  }
  signAndSendTransaction<T extends Transaction | VersionedTransaction>(
    transaction: T,
    options?: SendOptions | undefined
  ): Promise<{ signature: string }> {
    console.log("signAndSendTransaction");
    return Promise.reject("not implemented");
  }
  signAllTransactions<T extends Transaction | VersionedTransaction>(
    transactions: T[]
  ): Promise<T[]> {
    console.log("signAllTransactions");
    return Promise.reject("not implemented");
  }
  signIn(input?: SolanaSignInInput | undefined): Promise<SolSignInResponse> {
    return this.request({
      method: "sol_signInMessage",
      params: [JSON.stringify(input)],
    }).then((res: SolSignInResponse) => {
      const accExists = this.accounts.find(
        (acc) => acc.address === res.address
      );
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
      method: "sol_signMessage",
      params: [JSON.stringify(options)],
    }).then((res: SolSignInResponse) => res);
  }
  signTransaction(transaction: SolSignTransactionRequest): Promise<string> {
    console.log("signTransaction");
    return this.request({
      method: "sol_signTransaction",
      params: [JSON.stringify(transaction)],
    }).then((res: string) => res);
  }
  async request(request: EthereumRequest): Promise<any> {
    const res = (await this.sendMessageHandler(
      this.name,
      JSON.stringify(request)
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
  options: ProviderOptions
): void => {
  const provider = new Provider(options);
  initialize(provider);
  document["enkrypt"]["providers"][options.name] = provider;
};
export default injectDocument;
