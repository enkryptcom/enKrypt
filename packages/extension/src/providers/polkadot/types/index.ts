import { SendMessageHandler } from "@/types/provider";
import Accounts from "../libs/accounts";
import Metadata from "../libs/metadata";
import Provider from "../libs/provider";
import Signer from "../libs/signer";
import { RPCRequestType } from "@enkryptcom/types";
import { OnMessageResponse } from "@enkryptcom/types";

export interface SubstrateInjectOptions {
  dappName: string;
  sendMessageHandler: SendMessageHandler;
  id: number;
}

import type { Injected } from "@polkadot/extension-inject/types";

export abstract class SubstrateInjectedProvider implements Injected {
  accounts: Accounts;
  metadata: Metadata;
  provider: Provider;
  signer: Signer;
  dappName: string;
  id: number;
  sendMessageHandler: InjectedSendMessageHandler;
  constructor(options: InjectLibOptions) {
    this.dappName = options.dappName;
    this.sendMessageHandler = options.sendMessageHandler;
    this.id = options.id;
    this.accounts = new Accounts(options);
    this.metadata = new Metadata(options);
    this.provider = new Provider(options);
    this.signer = new Signer(options);
  }
  abstract handleMessage(request: RPCRequestType): void;
}

export interface RouterOnMessage extends RPCRequestType {
  id: number;
}

export type InjectedSendMessageHandler = (
  id: number,
  message: RPCRequestType
) => Promise<any>;

export interface InjectLibOptions {
  dappName: string;
  sendMessageHandler: InjectedSendMessageHandler;
  id: number;
}
