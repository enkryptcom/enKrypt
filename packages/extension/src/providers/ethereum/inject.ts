import EventEmitter from "eventemitter3";
import { handleIncomingMessage } from "./libs/message-handler";
import { EthereumRequest, EthereumResponse } from "./types";
import {
  ProviderName,
  ProviderOptions,
  ProviderType,
  ProviderInterface,
  SendMessageHandler,
} from "@/types/provider";
import { EXTENSION_VERSION } from "@/configs/constants";

export class Provider extends EventEmitter implements ProviderInterface {
  chainId: string;
  isEnkrypt: boolean;
  selectedAddress: string | null;
  connected: boolean;
  name: ProviderName;
  type: ProviderType;
  version: string = EXTENSION_VERSION;
  sendMessageHandler: SendMessageHandler;
  constructor(options: ProviderOptions) {
    super();
    this.chainId = "0x1"; //deprecated
    this.isEnkrypt = true;
    this.selectedAddress = null; //deprecated
    this.connected = true;
    this.name = options.name;
    this.type = options.type;
    this.sendMessageHandler = options.sendMessageHandler;
    window.dispatchEvent(new Event("ethereum#initialized"));
  }
  async request(request: EthereumRequest): Promise<EthereumResponse> {
    const res = (await this.sendMessageHandler(
      this.name,
      JSON.stringify(request)
    )) as EthereumResponse;
    return res;
  }
  enable(): Promise<any> {
    return this.request({ method: "eth_requestAccounts" });
  }
  isConnected(): boolean {
    return this.connected;
  }
  //deprecated
  send(method: string, params?: Array<unknown>): Promise<EthereumResponse> {
    return this.request({ method, params });
  }
  // //deprecated
  sendAsync(
    data: unknown,
    callback: (err: Error | null, res?: any) => void
  ): void {
    const { method, params } = data as EthereumRequest;
    this.request({ method, params })
      .then((res) => {
        callback(null, res);
      })
      .catch((err) => callback(err));
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
  document[options.name] = provider;
  document["enkrypt"]["providers"][options.name] = provider;
};
export default injectDocument;
