import type Transport from "@ledgerhq/hw-transport";
import webUsbTransport from "@ledgerhq/hw-transport-webusb";
import { HWwalletCapabilities, NetworkNames } from "@enkryptcom/types";
import SolApp from "@ledgerhq/hw-app-solana";
import HDKey from "hdkey";
import { bufferToHex } from "@enkryptcom/utils";
import {
  AddressResponse,
  getAddressRequest,
  HWWalletProvider,
  PathType,
  SignMessageRequest,
  SignTransactionRequest,
  SolSignTransaction,
} from "../../types";
import { supportedPaths } from "./configs";
import ConnectToLedger from "../ledgerConnect";

class LedgerSolana implements HWWalletProvider {
  transport: Transport | null;

  network: NetworkNames;

  HDNodes: Record<string, HDKey>;

  constructor(network: NetworkNames) {
    this.transport = null;
    this.network = network;
    this.HDNodes = {};
  }

  async init(): Promise<boolean> {
    if (!this.transport) {
      const support = await webUsbTransport.isSupported();
      if (support) {
        this.transport = await webUsbTransport.openConnected().then((res) => {
          if (!res) return webUsbTransport.create();
          return res;
        });
      } else {
        return Promise.reject(
          new Error("ledger-solana: webusb is not supported"),
        );
      }
    }
    return true;
  }

  async getAddress(options: getAddressRequest): Promise<AddressResponse> {
    if (!supportedPaths[this.network])
      return Promise.reject(new Error("ledger-solana: Invalid network name"));
    const connection = new SolApp(this.transport);
    return connection
      .getAddress(
        options.pathType.path.replace(`{index}`, options.pathIndex),
        false,
      )
      .then((res) => ({
        address: bufferToHex(res.address),
        publicKey: bufferToHex(res.address),
      }));
  }

  async signPersonalMessage(options: SignMessageRequest): Promise<string> {
    const connection = new SolApp(this.transport);
    return connection
      .signOffchainMessage(
        options.pathType.path.replace(`{index}`, options.pathIndex),
        options.message,
      )
      .then((result) => bufferToHex(result.signature));
  }

  async signTransaction(options: SignTransactionRequest): Promise<string> {
    const connection = new SolApp(this.transport);
    return connection
      .signTransaction(
        options.pathType.path.replace(`{index}`, options.pathIndex),
        (options.transaction as SolSignTransaction).solTx,
      )
      .then((result) => bufferToHex(result.signature));
  }

  getSupportedPaths(): PathType[] {
    return supportedPaths[this.network];
  }

  close(): Promise<void> {
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    return this.transport.close().catch(() => {});
  }

  isConnected(networkName: NetworkNames): Promise<boolean> {
    return ConnectToLedger.bind(this)(networkName);
  }

  static getSupportedNetworks(): NetworkNames[] {
    return Object.keys(supportedPaths) as NetworkNames[];
  }

  static getCapabilities(): string[] {
    return [HWwalletCapabilities.signMessage, HWwalletCapabilities.signTx];
  }
}

export default LedgerSolana;
