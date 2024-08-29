import TrezorConnect from "@trezor/connect-web";
import { getHDPath } from "@trezor/connect/lib/utils/pathUtils";
import { HWwalletCapabilities, NetworkNames } from "@enkryptcom/types";
import HDKey from "hdkey";
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

class TrezorEthereum implements HWWalletProvider {
  network: NetworkNames;

  HDNodes: Record<string, HDKey>;

  constructor(network: NetworkNames) {
    this.network = network;
    this.HDNodes = {};
  }

  async init(): Promise<boolean> {
    TrezorConnect.manifest({
      email: "info@enkrypt.com",
      appUrl: "https://www.enkrypt.com",
    });
    return true;
  }

  async getAddress(options: getAddressRequest): Promise<AddressResponse> {
    if (!supportedPaths[this.network])
      return Promise.reject(new Error("trezor-bitcoin: Invalid network name"));

    if (!this.HDNodes[options.pathType.basePath]) {
      const rootPub = await TrezorConnect.getPublicKey({
        path: options.pathType.basePath,
        showOnTrezor: options.confirmAddress,
      });
      if (!rootPub.payload) {
        throw new Error("popup failed to open");
      }
      if (!rootPub.success)
        throw new Error((rootPub.payload as any).error as string);

      const hdKey = new HDKey();
      hdKey.publicKey = Buffer.from(rootPub.payload.publicKey, "hex");
      hdKey.chainCode = Buffer.from(rootPub.payload.chainCode, "hex");
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

  getSupportedPaths(): PathType[] {
    return supportedPaths[this.network];
  }

  close(): Promise<void> {
    return Promise.resolve();
  }

  isConnected(): Promise<boolean> {
    return Promise.resolve(true);
  }

  async signPersonalMessage(options: SignMessageRequest): Promise<string> {
    const result = await TrezorConnect.signMessage({
      path: options.pathType.path.replace(`{index}`, options.pathIndex),
      message: options.message.toString("hex"),
      hex: true,
    });
    if (!result.success)
      throw new Error((result.payload as any).error as string);
    return bufferToHex(Buffer.from(result.payload.signature, "base64"));
  }

  async signTransaction(options: SignTransactionRequest): Promise<string> {
    const transactionOptions = options.transaction as BTCSignTransaction;
    const addressN = getHDPath(
      options.pathType.path.replace(`{index}`, options.pathIndex)
    );
    return TrezorConnect.signTransaction({
      coin: "btc",
      inputs: transactionOptions.psbtTx.txInputs.map((tx, idx) => ({
        address_n: addressN,
        prev_hash: tx.hash.reverse().toString("hex"),
        prev_index: tx.index,
        amount: transactionOptions.psbtTx.data.inputs[idx].witnessUtxo.value,
        script_type: "SPENDWITNESS",
      })),
      outputs: transactionOptions.psbtTx.txOutputs.map((out) => ({
        amount: out.value,
        address: out.address,
        script_type: "PAYTOADDRESS",
      })),
    }).then((res) => {
      if (!res.success) throw new Error((res.payload as any).error as string);
      return res.payload.serializedTx;
    });
  }

  static getSupportedNetworks(): NetworkNames[] {
    return Object.keys(supportedPaths) as NetworkNames[];
  }

  static getCapabilities(): string[] {
    return [HWwalletCapabilities.signMessage, HWwalletCapabilities.signTx];
  }
}

export default TrezorEthereum;
