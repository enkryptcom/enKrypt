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

export class Provider extends EventEmitter implements ProviderInterface {
  chainId: string;
  isEnkrypt: boolean;
  selectedAddress: string | null;
  connected: boolean;
  name: ProviderName;
  type: ProviderType;
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
  }
  async request(request: EthereumRequest): Promise<EthereumResponse> {
    console.log(request);
    const res = (await this.sendMessageHandler(
      this,
      JSON.stringify(request)
    )) as EthereumResponse;
    console.log(res);
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
  document[ProviderName.ethereum] = provider;
  document["enkrypt"]["providers"][ProviderName.ethereum] = provider;
};
export default injectDocument;
