import type Transport from "@ledgerhq/hw-transport";
import webUsbTransport from "@ledgerhq/hw-transport-webusb";
import { HWwalletCapabilities, NetworkNames } from "@enkryptcom/types";
import { LedgerApps } from "./substrateApps";
import {
  AddressResponse,
  getAddressRequest,
  HWWalletProvider,
  PathType,
} from "../../types";
import { bip32ToAddressNList } from "./utils";
import { supportedPaths } from "./configs";
import ConnectToLedger from "../ledgerConnect";

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

  async getAddress(options: getAddressRequest): Promise<AddressResponse> {
    if (!LedgerApps[this.network])
      return Promise.reject(
        new Error("ledger-substrate: Invalid network name")
      );
    const app = LedgerApps[this.network];
    const pathValues = bip32ToAddressNList(
      options.pathType.path.replace(`{index}`, options.pathIndex)
    );
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
      .then((res) => ({
        address: res.address,
        publicKey: `0x${res.pubKey}`,
      }));
  }

  signMessage() {
    throw new Error("Not Supported");
  }

  getSupportedPaths(): PathType[] {
    return supportedPaths;
  }

  close(): Promise<void> {
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    return this.transport.close().catch(() => {});
  }

  isConnected(networkName: NetworkNames): Promise<boolean> {
    return ConnectToLedger.bind(this)(networkName);
  }

  signPersonalMessage(): Promise<string> {
    throw new Error("hw-wallet:substrate: sign Personal message not supported");
  }

  signTransaction(): Promise<string> {
    throw new Error("hw-wallet:substrate: sign transaction not supported");
  }

  static getSupportedNetworks(): NetworkNames[] {
    return Object.keys(LedgerApps) as NetworkNames[];
  }

  static getCapabilities(): string[] {
    return [HWwalletCapabilities.signTx];
  }
}

export default LedgerSubstrate;
