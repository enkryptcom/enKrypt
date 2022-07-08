import type Transport from "@ledgerhq/hw-transport";
import webUsbTransport from "@ledgerhq/hw-transport-webusb";
import { NetworkNames } from "@enkryptcom/types";
import EthApp from "@ledgerhq/hw-app-eth";
import { getAddressRequest, HWWalletProvider, PathType } from "../../types";
import { supportedPaths } from "./configs";
import ConnectToLedger from "../ledgerConnect";

class LedgerEthereum implements HWWalletProvider {
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
          new Error("ledger-ethereum: webusb is not supported")
        );
      }
    }
    return true;
  }

  async getAddress(options: getAddressRequest): Promise<string> {
    if (!supportedPaths[this.network])
      return Promise.reject(new Error("ledger-ethereum: Invalid network name"));
    const connection = new EthApp(this.transport);
    return connection
      .getAddress(options.path, options.confirmAddress)
      .then((res) => res.address);
  }

  signMessage() {
    throw new Error("Not Supported");
  }

  getSupportedPaths(): PathType[] {
    return supportedPaths[this.network];
  }

  isConnected(networkName: NetworkNames): Promise<boolean> {
    return ConnectToLedger.bind(this)(networkName);
  }

  static getSupportedNetworks(): NetworkNames[] {
    return Object.keys(supportedPaths) as NetworkNames[];
  }
}

export default LedgerEthereum;
