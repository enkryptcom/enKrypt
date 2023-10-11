import type Transport from "@ledgerhq/hw-transport";
import webUsbTransport from "@ledgerhq/hw-transport-webusb";
import TransportWebHID from "@ledgerhq/hw-transport-webhid";
import { HWwalletCapabilities, NetworkNames } from "@enkryptcom/types";
import {
  AddressResponse,
  getAddressRequest,
  HWWalletProvider,
  PathType,
  SignTransactionRequest,
} from "../../types";
import { supportedPaths } from "./configs";
import ConnectToLedger from "../ledgerConnect";
import Kadena from "./Kadena";

class LedgerKadena implements HWWalletProvider {
  transport: Transport | null;

  network: NetworkNames;

  constructor(network: NetworkNames) {
    this.transport = null;
    this.network = network;
  }

  async init(): Promise<boolean> {
    if (!this.transport) {
      const support = await TransportWebHID.isSupported();
      if (support && !this.transport) {
        this.transport = await TransportWebHID.create();
      } else {
        return Promise.reject(
          new Error("ledger-kadena: webHID is not supported")
        );
      }
    }
    return true;
  }

  async getAddress(options: getAddressRequest): Promise<AddressResponse> {
    console.log("getAddress options", options);
    const pathValue = options.pathType.path.replace(
      `{index}`,
      options.pathIndex
    );
    const connection = new Kadena(this.transport);
    return connection.getPublicKey(pathValue).then((res) => ({
        address: `k:${Buffer.from(res.publicKey).toString("hex")}`,
        publicKey: Buffer.from(res.publicKey).toString("hex"),
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
    console.log("signTransaction options", options);
    const pathValue = options.pathType.path.replace(
      `{index}`,
      options.pathIndex
    );

    const connection = new Kadena(this.transport);
    const tx = JSON.parse(options.transaction as any);
    const signedTransaction = await connection.signTransferCreateTx({
      path: pathValue,
      recipient: tx.signers[0].clist[0].args[1],
      amount: tx.signers[0].clist[0].args[2].decimal,
      chainId: tx.meta.chainId,
      network: tx.networkId,
    });
    return JSON.stringify(signedTransaction.pact_command);
  }

  static getSupportedNetworks(): string[] {
    return [NetworkNames.Kadena, NetworkNames.KadenaTestnet];
  }

  static getCapabilities(): string[] {
    return [HWwalletCapabilities.signTx];
  }
}

export default LedgerKadena;
