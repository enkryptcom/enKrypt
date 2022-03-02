import { SendMessageHandler } from "@/types/provider";
import Accounts from "../libs/accounts";
import Metadata from "../libs/metadata";

export interface SubstrateInjectOptions {
  sendMessageHandler: SendMessageHandler;
}

import type { Injected } from "@polkadot/extension-inject/types";

export abstract class SubstrateInjectedProvider implements Injected {
  accounts: Accounts;
  metadata: Metadata;
  provider: any;
  signer: any;
  sendMessageHandler: SendMessageHandler;
  constructor(options: SubstrateInjectOptions) {
    this.name = options.name;
    this.type = options.type;
    this.sendMessageHandler = options.sendMessageHandler;
  }
}
