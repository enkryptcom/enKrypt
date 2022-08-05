import {
  InjectedSendMessageHandler,
  InjectLibOptions,
  BitcoinInjectedProvider,
} from "../types";
import Accounts from "./accounts";
import Signer from "./signer";
import { RPCRequestType } from "@enkryptcom/types";

class InjectedProvider implements BitcoinInjectedProvider {
  accounts: Accounts;
  signer: Signer;
  dappName: string;
  id: number;
  sendMessageHandler: InjectedSendMessageHandler;
  constructor(options: InjectLibOptions) {
    this.dappName = options.dappName;
    this.id = options.id;
    this.accounts = new Accounts(options);
    this.signer = new Signer(options);
    this.sendMessageHandler = options.sendMessageHandler;
  }
  handleMessage(request: RPCRequestType): void {
    const { method, params } = request;
    console.info(method, params);
  }
}

export default InjectedProvider;
