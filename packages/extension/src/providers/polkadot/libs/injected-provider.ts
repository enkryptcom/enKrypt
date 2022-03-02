import { SubstrateInjectedProvider, SubstrateInjectOptions } from "../types";
import { SendMessageHandler } from "@/types/provider";
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
  sendMessageHandler: SendMessageHandler;
  constructor(options: SubstrateInjectOptions) {
    this.dappName = options.dappName;
    this.accounts = new Accounts();
    this.metadata = new Metadata();
    this.provider = new Provider();
    this.signer = new Signer();
    this.sendMessageHandler = options.sendMessageHandler;
  }
  handleMessage(request: RPCRequestType): void {
    const { method, params } = request;
    console.log(method, params);
  }
}

export default InjectedProvider;
