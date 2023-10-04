import { Kadena } from "hw-app-kda";
import type Transport from "@ledgerhq/hw-transport";
import webUsbTransport from "@ledgerhq/hw-transport-webusb";
import { HWwalletCapabilities, NetworkNames } from "@enkryptcom/types";
import { ExtrinsicPayload } from "@polkadot/types/interfaces";
import { u8aToBuffer } from "@polkadot/util";
import {
  AddressResponse,
  getAddressRequest,
  HWWalletProvider,
  PathType,
  SignTransactionRequest,
} from "../../types";
import { bip32ToAddressNList } from "./utils";
import { supportedPaths } from "./configs";
import ConnectToLedger from "../ledgerConnect";

// const Kadena = require("hw-app-kda").default;

class LedgerKadena implements HWWalletProvider {
  transport: Transport | null;

  network: NetworkNames;

  constructor(network: NetworkNames) {
    this.transport = null;
    this.network = network;
  }

  validatePathAndNetwork(options: getAddressRequest | SignTransactionRequest) {
    console.log({ f: this.network });
    if (this.network !== "KDA")
      throw new Error("ledger-kadena: Invalid network name");
    const pathValues = bip32ToAddressNList(
      options.pathType.path.replace(`{index}`, options.pathIndex)
    );
    if (pathValues.length < 3) throw new Error("ledger-kadena: Invalid path");
  }

  async init(): Promise<boolean> {
    if (!this.transport) {
      const support = await webUsbTransport.isSupported();
      if (support) {
        this.transport = await webUsbTransport.create();
      } else {
        return Promise.reject(
          new Error("ledger-kadena: webusb is not supported")
        );
      }
    }
    return true;
  }

  async getAddress(options: getAddressRequest): Promise<AddressResponse> {
    this.validatePathAndNetwork(options);
    const pathValues = bip32ToAddressNList(
      options.pathType.path.replace(`{index}`, options.pathIndex)
    );
    const connection = new Kadena(this.transport);
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
    throw new Error("hw-wallet:kadena: sign Personal message not supported");
  }

  async signTransaction(options: SignTransactionRequest): Promise<string> {
    this.validatePathAndNetwork(options);
    const pathValues = bip32ToAddressNList(
      options.pathType.path.replace(`{index}`, options.pathIndex)
    );
    const tx = options.transaction as ExtrinsicPayload;
    const connection = new Kadena(this.transport);
    return connection
      .sign(
        pathValues[0],
        pathValues[1],
        pathValues[2],
        u8aToBuffer(tx.toU8a(true))
      )
      .then((result) => {
        if (result.error_message !== "No errors")
          throw new Error(result.error_message);
        else return `0x${result.signature.toString("hex")}`;
      });
  }

  static getSupportedNetworks(): string[] {
    return ["KDA"];
  }

  static getCapabilities(): string[] {
    return [HWwalletCapabilities.signTx];
  }
}

export default LedgerKadena;
