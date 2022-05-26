import webUsbTransport from "@ledgerhq/hw-transport-webusb";
import { TransportMessage, WalletType } from "../types";
import Browser from "webextension-polyfill";

const HWwalletContentScriptHandler = () => {
  Browser.runtime.onMessage.addListener((request): Promise<string> => {
    const data: TransportMessage = request;
    if (data.wallet === WalletType.ledger) {
      return webUsbTransport.create().then((tport) =>
        tport
          .exchange(Buffer.from(data.msg.replace("0x", ""), "hex"))
          .then((res) => {
            return `0x${Buffer.from(res).toString("hex")}`;
          })
      );
    }
    throw new Error(`Content-script: unknown wallet type: ${data.wallet}`);
  });
};
export default HWwalletContentScriptHandler;
