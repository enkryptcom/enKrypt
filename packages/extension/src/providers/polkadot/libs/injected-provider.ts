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
    this.accounts = new Proxy(new Accounts(options), ProxyHandler);
    this.metadata = new Proxy(new Metadata(options), ProxyHandler);
    this.provider = new Proxy(new Provider(options), ProxyHandler);
    this.signer = new Proxy(new Signer(options), ProxyHandler);
    this.sendMessageHandler = options.sendMessageHandler;
  }
  handleMessage(request: RPCRequestType): void {
    const { method, params } = request;
    console.info(method, params);
  }
}
const ProxyHandler = {
  set(target: any, name: keyof any, value: any) {
    return Reflect.set(target, name, value);
  },
  get(target: any, prop: keyof any) {
    if (typeof target[prop] === "function") {
      return (target[prop] as () => any).bind(target);
    }
    return target[prop];
  },
};
export default InjectedProvider;
