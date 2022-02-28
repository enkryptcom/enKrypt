import { EventEmitter } from "events";

class Provider extends EventEmitter {
  chainId: string;
  isMetaMask: boolean;
  networkVersion: string;
  selectedAddress: string;
  constructor() {
    super();
    this.chainId = "0x1";
    this.isMetaMask = true;
    this.networkVersion = "1";
    this.selectedAddress = "0xDECAF9CD2367cdbb726E904cD6397eDFcAe6068D";
  }
  request(req: unknown) {
    console.log("request", req);
  }
  enable() {
    return this.request({ method: "eth_requestAccounts" });
  }
  netVersion() {
    return this.request({ method: "net_version" });
  }
  isConnected(): boolean {
    return true;
  }
  send(msg: unknown): void {
    console.log("send", msg);
  }
  sendAsync(msg: unknown): void {
    console.log("sendAsync", msg);
  }
}
export default {
  name: "ethereum",
  provider: Provider,
};
