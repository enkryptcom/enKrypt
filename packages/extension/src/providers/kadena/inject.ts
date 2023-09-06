import EventEmitter from "eventemitter3";
import { EthereumRequest, EthereumResponse } from "@/providers/ethereum/types";
import {
  ProviderName,
  ProviderOptions,
  ProviderType,
  ProviderInterface,
  SendMessageHandler,
} from "@/types/provider";
import { EXTENSION_VERSION } from "@/configs/constants";
import { EnkryptWindow } from "@/types/globals";
import { KadenaNetworks } from "./types";

export class Provider extends EventEmitter implements ProviderInterface {
  connected: boolean;
  name: ProviderName;
  type: ProviderType;
  version: string = EXTENSION_VERSION;
  autoRefreshOnNetworkChange = false;
  networks: typeof KadenaNetworks;
  sendMessageHandler: SendMessageHandler;

  constructor(options: ProviderOptions) {
    super();
    this.connected = true;
    this.name = options.name;
    this.type = options.type;
    this.networks = KadenaNetworks;
    this.sendMessageHandler = options.sendMessageHandler;
  }

  async request(request: EthereumRequest): Promise<EthereumResponse> {
    const res = (await this.sendMessageHandler(
      this.name,
      JSON.stringify(request)
    )) as EthereumResponse;
    return res;
  }

  isConnected(): boolean {
    return this.connected;
  }

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  handleMessage(msg: string): void {}
}

const injectDocument = (
  document: EnkryptWindow | Window,
  options: ProviderOptions
): void => {
  const provider = new Provider(options);
  document["enkrypt"]["providers"][options.name] = provider;
};

export default injectDocument;
