import type Transport from "@ledgerhq/hw-transport";
import webUsbTransport from "@ledgerhq/hw-transport-webusb";
import bleTransport from '@ledgerhq/hw-transport-web-ble';

export default class LedgerInit {
  transport: Transport | null;

  constructor() {
    this.transport = null;
  }
  async init(): Promise<boolean> {

    if (!this.transport) {
      try {
        const BLEsupport = await bleTransport.isSupported();
        if (BLEsupport) {
          const transport = await bleTransport.create();
          transport.on("disconnect", () => { // connection wasnt succesful
            this.transport = null;
          })
          this.transport = transport;
        }

      } catch {
        const support = await webUsbTransport.isSupported();
        if (support) {
          this.transport = await webUsbTransport.openConnected().then((res) => {
            if (!res) return webUsbTransport.create();
            return res;
          });

        } else {
          return Promise.reject(
            new Error("ledger-ethereum: webusb is not supported"),
          );
        }
      }

    }
    return true;
  }
}