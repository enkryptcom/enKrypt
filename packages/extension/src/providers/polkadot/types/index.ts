import { SendMessageHandler } from "@/types/provider";
import Accounts from "../libs/accounts";
import Metadata from "../libs/metadata";
import Provider from "../libs/provider";
import Signer from "../libs/signer";
import { RPCRequestType } from "@enkryptcom/types";

export interface SubstrateInjectOptions {
  dappName: string;
  sendMessageHandler: SendMessageHandler;
}

import type { Injected } from "@polkadot/extension-inject/types";

export abstract class SubstrateInjectedProvider implements Injected {
  accounts: Accounts;
  metadata: Metadata;
  provider: Provider;
  signer: Signer;
  dappName: string;
  sendMessageHandler: SendMessageHandler;
  constructor(options: SubstrateInjectOptions) {
    this.dappName = options.dappName;
    this.sendMessageHandler = options.sendMessageHandler;
    this.accounts = new Accounts();
    this.metadata = new Metadata();
    this.provider = new Provider();
    this.signer = new Signer();
  }
  abstract handleMessage(request: RPCRequestType): void;
}

export interface RouterOnMessage {
  providerId: number;
  action: RPCRequestType;
}
