import type Transport from "@ledgerhq/hw-transport";
import webUsbTransport from "@ledgerhq/hw-transport-webusb";
import { HWwalletCapabilities, NetworkNames } from "@enkryptcom/types";
import BtcApp from "@ledgerhq/hw-app-btc";
import HDKey from "hdkey";
import type { CreateTransactionArg } from "@ledgerhq/hw-app-btc/lib/createTransaction";
import { serializeTransactionOutputs } from "@ledgerhq/hw-app-btc/lib/serializeTransaction";
import { bufferToHex } from "@enkryptcom/utils";

import {
  AddressResponse,
  BTCSignTransaction,
  getAddressRequest,
  HWWalletProvider,
  PathType,
  SignMessageRequest,
  SignTransactionRequest,
} from "../../types";
import { supportedPaths } from "./configs";
import ConnectToLedger from "../ledgerConnect";

class LedgerBitcoin implements HWWalletProvider {
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
          new Error("ledger-bitcoin: webusb is not supported")
        );
      }
    }
    return true;
  }

  async getAddress(options: getAddressRequest): Promise<AddressResponse> {
    if (!supportedPaths[this.network])
      return Promise.reject(new Error("ledger-bitcoin: Invalid network name"));
    const isHardened = options.pathType.basePath.split("/").length - 1 === 2;
    const connection = new BtcApp({ transport: this.transport });
    if (!isHardened) {
      if (!this.HDNodes[options.pathType.basePath]) {
        const rootPub = await connection.getWalletPublicKey(
          options.pathType.basePath,
          { format: "bech32" }
        );
        const hdKey = new HDKey();
        hdKey.publicKey = Buffer.from(rootPub.publicKey, "hex");
        hdKey.chainCode = Buffer.from(rootPub.chainCode, "hex");
        this.HDNodes[options.pathType.basePath] = hdKey;
      }
      const pubkey = this.HDNodes[options.pathType.basePath].derive(
        `m/${options.pathIndex}`
      ).publicKey;
      return {
        address: bufferToHex(pubkey),
        publicKey: bufferToHex(pubkey),
      };
    }

    return connection
      .getWalletPublicKey(
        options.pathType.path.replace(`{index}`, options.pathIndex),
        { format: "bech32" }
      )
      .then((res) => {
        console.log(res);
        return res;
      })
      .then((res) => ({
        address: `0x${res.publicKey}`,
        publicKey: `0x${res.publicKey}`,
      }));
  }

  signPersonalMessage(options: SignMessageRequest): Promise<string> {
    const connection = new BtcApp({ transport: this.transport });
    return connection
      .signMessage(
        options.pathType.path.replace(`{index}`, options.pathIndex),
        options.message.toString("hex")
      )
      .then((result) => {
        const v = result.v + 27 + 4;
        const signature = Buffer.from(
          v.toString(16) + result.r + result.s,
          "hex"
        );
        return bufferToHex(signature);
      });
  }

  async signTransaction(options: SignTransactionRequest): Promise<string> {
    const connection = new BtcApp({ transport: this.transport });
    console.log(options);
    const transactionOptions = options.transaction as BTCSignTransaction;
    const txOutputs = transactionOptions.psbtTx.txOutputs.map((out) => {
      const valLE = Buffer.alloc(8);
      valLE.writeBigInt64LE(BigInt(out.value));
      return {
        amount: valLE,
        script: Buffer.from(out.script),
      };
    });
    console.log(txOutputs);
    const txArg: CreateTransactionArg = {
      inputs: transactionOptions.rawTxs.map((rTx, idx) => [
        connection.splitTransaction(rTx.replace("0x", ""), true),
        transactionOptions.psbtTx.txInputs[idx].index,
        transactionOptions.psbtTx.data.inputs[idx].witnessScript
          ? transactionOptions.psbtTx.data.inputs[idx].witnessScript.toString(
              "hex"
            )
          : undefined,
        undefined,
      ]),
      associatedKeysets: transactionOptions.rawTxs.map(() =>
        options.pathType.path.replace(`{index}`, options.pathIndex)
      ),
      outputScriptHex: serializeTransactionOutputs({
        outputs: txOutputs,
      } as any).toString("hex"),
      segwit: true,
      additionals: ["bech32"],
    };
    console.log(txArg);
    return connection.createPaymentTransaction(txArg).then((result) => result);
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

export default LedgerBitcoin;
