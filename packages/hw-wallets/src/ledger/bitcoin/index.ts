import type Transport from "@ledgerhq/hw-transport";
import webUsbTransport from "@ledgerhq/hw-transport-webusb";
import bs58 from "bs58";
import { AppClient, DefaultWalletPolicy } from "ledger-bitcoin";
import { HWwalletCapabilities, NetworkNames } from "@enkryptcom/types";
import BtcApp from "@ledgerhq/hw-app-btc";
import HDKey from "hdkey";
import type { CreateTransactionArg } from "@ledgerhq/hw-app-btc/lib/createTransaction";
import { serializeTransactionOutputs } from "@ledgerhq/hw-app-btc/lib/serializeTransaction";
import { bufferToHex } from "@enkryptcom/utils";
import {
  pathStringToArray,
  pathArrayToString,
  // pubkeyFromXpub,
} from "@ledgerhq/hw-app-btc/lib/bip32";
import {
  AddressResponse,
  BitcoinSignMessage,
  BTCSignTransaction,
  getAddressRequest,
  HWWalletProvider,
  PathType,
  SignTransactionRequest,
} from "../../types";
import { supportedPaths } from "./configs";
import ConnectToLedger from "../ledgerConnect";

class LedgerBitcoin implements HWWalletProvider {
  transport: Transport | null;

  network: NetworkNames;

  HDNodes: Record<string, HDKey>;

  isSegwit: boolean;

  constructor(network: NetworkNames) {
    this.transport = null;
    this.network = network;
    this.HDNodes = {};
    this.isSegwit = !!(
      this.network === NetworkNames.Bitcoin ||
      this.network === NetworkNames.Litecoin
    );
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
          new Error("ledger-bitcoin: webusb is not supported"),
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
    const hdKey = new HDKey();
    if (!isHardened) {
      if (!this.HDNodes[options.pathType.basePath]) {
        const rootPub = await connection.getWalletPublicKey(
          options.pathType.basePath,
          { format: this.isSegwit ? "bech32" : "legacy" },
        );
        hdKey.publicKey = Buffer.from(rootPub.publicKey, "hex");
        hdKey.chainCode = Buffer.from(rootPub.chainCode, "hex");
        this.HDNodes[options.pathType.basePath] = hdKey;
      }
      const pubkey = this.HDNodes[options.pathType.basePath].derive(
        `m/${options.pathIndex}`,
      ).publicKey;
      return {
        address: bufferToHex(pubkey),
        publicKey: bufferToHex(pubkey),
      };
    }

    return connection
      .getWalletPublicKey(
        options.pathType.path.replace(`{index}`, options.pathIndex),
        { format: this.isSegwit ? "bech32" : "legacy" },
      )
      .then((res) => {
        hdKey.publicKey = Buffer.from(res.publicKey, "hex");
        hdKey.chainCode = Buffer.from(res.chainCode, "hex");
        return {
          address: bufferToHex(hdKey.publicKey),
          publicKey: bufferToHex(hdKey.publicKey),
        };
      });
  }

  async signPersonalMessage(options: BitcoinSignMessage): Promise<string> {
    if (options.type === "bip322-simple") {
      if (!options.psbtTx) {
        return Promise.reject(
          new Error("ledger-bitcoin: psbt not set for message signing"),
        );
      }
      const client = new AppClient(this.transport as any);
      const fpr = await client.getMasterFingerprint();
      const accountPath = options.pathType.path.replace(
        `{index}`,
        options.pathIndex,
      );
      const pathElems: number[] = pathStringToArray(accountPath);
      const rootPath = pathElems.slice(0, -2);
      const accountRootPubkey = await client.getExtendedPubkey(
        pathArrayToString(rootPath),
        false,
      );
      options.psbtTx.data.inputs[0].bip32Derivation[0].masterFingerprint =
        Buffer.from(fpr, "hex");
      options.psbtTx.data.inputs[0].bip32Derivation[0].path = accountPath;
      options.psbtTx.updateGlobal({
        globalXpub: [
          {
            extendedPubkey: Buffer.from(
              bs58.decode(accountRootPubkey),
            ).subarray(0, -4),
            masterFingerprint: Buffer.from(fpr, "hex"),
            path: accountPath,
          },
        ],
      });
      const accountPolicy = new DefaultWalletPolicy(
        "wpkh(@0/**)",
        `[${fpr}/${pathArrayToString(rootPath).replace(
          "m/",
          "",
        )}]${accountRootPubkey}`,
      );
      const sigs = await client.signPsbt(
        options.psbtTx.toBase64(),
        accountPolicy,
        null,
      );
      options.psbtTx.updateInput(0, {
        partialSig: [sigs[0][1]],
      });
      options.psbtTx.finalizeAllInputs();
      return options.psbtTx.extractTransaction().toHex();
    }
    const connection = new BtcApp({ transport: this.transport });
    return connection
      .signMessage(
        options.pathType.path.replace(`{index}`, options.pathIndex),
        options.message.toString("hex"),
      )
      .then((result) => {
        const v = result.v + 27 + 4;
        const signature = Buffer.from(
          v.toString(16) + result.r + result.s,
          "hex",
        );
        return bufferToHex(signature);
      });
  }

  async signTransaction(options: SignTransactionRequest): Promise<string> {
    const connection = new BtcApp({ transport: this.transport });
    const transactionOptions = options.transaction as BTCSignTransaction;
    const txOutputs = transactionOptions.psbtTx.txOutputs.map((out) => {
      const valLE = Buffer.alloc(8);
      valLE.writeBigInt64LE(BigInt(out.value));
      return {
        amount: valLE,
        script: Buffer.from(out.script),
      };
    });
    const txArg: CreateTransactionArg = {
      inputs: transactionOptions.rawTxs.map((rTx, idx) => [
        connection.splitTransaction(rTx.replace("0x", ""), true),
        transactionOptions.psbtTx.txInputs[idx].index,
        transactionOptions.psbtTx.data.inputs[idx].witnessScript
          ? transactionOptions.psbtTx.data.inputs[idx].witnessScript.toString(
              "hex",
            )
          : undefined,
        undefined,
      ]),
      associatedKeysets: transactionOptions.rawTxs.map(() =>
        options.pathType.path.replace(`{index}`, options.pathIndex),
      ),
      outputScriptHex: serializeTransactionOutputs({
        outputs: txOutputs,
      } as any).toString("hex"),
      segwit: this.isSegwit,
      additionals: [],
    };
    if (this.isSegwit) {
      txArg.additionals.push("bech32");
    }
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
