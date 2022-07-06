import type Transport from "@ledgerhq/hw-transport";
import webUsbTransport from "@ledgerhq/hw-transport-webusb";
import { NetworkNames } from "@enkryptcom/types";
import { LedgerApps } from "./substrateApps";
import { getAddressRequest, HWWalletProvider } from "../../types";
import { bip32ToAddressNList } from "./utils";
import { supportedPaths } from "./configs";

class LedgerSubstrate implements HWWalletProvider {
  transport: Transport | null;

  network: NetworkNames;

  constructor(network: NetworkNames) {
    this.transport = null;
    this.network = network;
  }

  async init(): Promise<boolean> {
    if (!this.transport) {
      const support = await webUsbTransport.isSupported();
      if (support) {
        this.transport = await webUsbTransport.create();
      } else {
        return Promise.reject(
          new Error("ledger-substrate: webusb is not supported")
        );
      }
    }
    return true;
  }

  async getAddress(options: getAddressRequest): Promise<string> {
    if (!LedgerApps[this.network])
      return Promise.reject(
        new Error("ledger-substrate: Invalid network name")
      );
    const app = LedgerApps[this.network];
    const pathValues = bip32ToAddressNList(options.path);
    if (pathValues.length < 3)
      return Promise.reject(new Error("ledger-substrate: Invalid path"));
    const connection = app(this.transport);
    return connection
      .getAddress(
        pathValues[0],
        pathValues[1],
        pathValues[2],
        options.confirmAddress
      )
      .then((res) => res.address);
  }

  signMessage() {
    throw new Error("Not Supported");
  }

  getSupportedPaths(): string[] {
    return supportedPaths;
  }

  static getSupportedNetworks(): NetworkNames[] {
    return Object.keys(LedgerApps) as NetworkNames[];
  }
}

export default LedgerSubstrate;
