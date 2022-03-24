import {
  InjectedSendMessageHandler,
  InjectLibOptions,
  SubstrateInjectedProvider,
} from "../types";
import Accounts from "./accounts";
import Metadata from "./metadata";
import Provider from "./provider";
import Signer from "./signer";
import { RPCRequestType } from "@enkryptcom/types";

class InjectedProvider implements SubstrateInjectedProvider {
  accounts: Accounts;
  metadata: Metadata;
  provider: Provider;
  signer: Signer;
  dappName: string;
  id: number;
  sendMessageHandler: InjectedSendMessageHandler;
  constructor(options: InjectLibOptions) {
    this.dappName = options.dappName;
    this.id = options.id;
    this.accounts = new Accounts(options);
    this.metadata = new Metadata(options);
    this.provider = new Provider(options);
    this.signer = new Signer(options);
    this.sendMessageHandler = options.sendMessageHandler;
  }
  handleMessage(request: RPCRequestType): void {
    const { method, params } = request;
    console.info(method, params);
  }
}

export default InjectedProvider;
