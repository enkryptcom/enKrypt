import { EventEmitter } from "events";
import MessageHandler from "./libs/message-handler";
import { ProviderMessage } from "./types";
export class Provider extends EventEmitter {
  chainId: string;
  isEnkrypt: boolean;
  selectedAddress: string | null;
  connected: boolean;
  constructor() {
    super();
    this.chainId = "0x1"; //deprecated
    this.isEnkrypt = true;
    this.selectedAddress = null; //deprecated
    this.connected = true;
  }
  async request(req: unknown) {
    console.log("request", req);
  }
  enable() {
    return this.request({ method: "eth_requestAccounts" });
  }
  isConnected(): boolean {
    return this.connected;
  }
  //deprecated
  send(data: unknown, callback: (err: Error | null, res?: any) => void): void {
    const { method, params } = data as ProviderMessage;
    this.request({ method, params })
      .then((res) => {
        callback(null, res);
      })
      .catch((err) => callback(err));
  }
  //deprecated
  sendAsync(
    data: unknown,
    callback: (err: Error | null, res?: any) => void
  ): void {
    this.send(data, callback);
  }
  handleMessage(msg: string): void {
    MessageHandler(this, msg);
  }
}
export default {
  name: "ethereum1",
  provider: Provider,
};
