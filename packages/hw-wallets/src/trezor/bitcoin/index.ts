import { getHDPath } from "@trezor/connect/lib/utils/pathUtils";
import { HWwalletCapabilities, NetworkNames } from "@enkryptcom/types";
import HDKey from "hdkey";
import { bufferToHex } from "@enkryptcom/utils";
import type { TrezorConnect } from "@trezor/connect-web";
import {
  AddressResponse,
  BitcoinSignMessage,
  BTCSignTransaction,
  getAddressRequest,
  HWWalletProvider,
  PathType,
  SignTransactionRequest,
} from "../../types";
import { supportedPaths, TrezorNetworkConfigs } from "./configs";
import getTrezorConnect from "../trezorConnect";

class TrezorBitcoin implements HWWalletProvider {
  network: NetworkNames;
  TrezorConnect: TrezorConnect;
  HDNodes: Record<string, HDKey>;

  constructor(network: NetworkNames) {
    this.network = network;
    this.HDNodes = {};
  }

  async init(): Promise<boolean> {
    this.TrezorConnect = await getTrezorConnect();
    return true;
  }

  async getAddress(options: getAddressRequest): Promise<AddressResponse> {
    if (!supportedPaths[this.network])
      return Promise.reject(new Error("trezor-bitcoin: Invalid network name"));

    if (!this.HDNodes[options.pathType.basePath]) {
      const rootPub = await this.TrezorConnect.getPublicKey({
        path: options.pathType.basePath,
        showOnTrezor: options.confirmAddress,
      } as any);
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
      `m/${options.pathIndex}`,
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

  async signPersonalMessage(options: BitcoinSignMessage): Promise<string> {
    if (options.type === "bip322-simple") {
      throw new Error("trezor-bitcoin: bip322 signing not supported");
    }
    const result = await this.TrezorConnect.signMessage({
      path: options.pathType.path.replace(`{index}`, options.pathIndex),
      message: options.message.toString("hex"),
      hex: true,
    } as any);
    if (!result.success)
      throw new Error((result.payload as any).error as string);
    return bufferToHex(Buffer.from(result.payload.signature, "base64"));
  }

  async signTransaction(options: SignTransactionRequest): Promise<string> {
    const transactionOptions = options.transaction as BTCSignTransaction;
    const addressN = getHDPath(
      options.pathType.path.replace(`{index}`, options.pathIndex),
    );
    return this.TrezorConnect.signTransaction({
      coin: TrezorNetworkConfigs[this.network].symbol,
      inputs: transactionOptions.psbtTx.txInputs.map((tx) => ({
        address_n: addressN,
        prev_hash: tx.hash.reverse().toString("hex"),
        prev_index: tx.index,
        amount: 0, // doesnt seem like this do anything
        script_type: TrezorNetworkConfigs[this.network].isSegwit
          ? "SPENDWITNESS"
          : "SPENDADDRESS",
      })),
      outputs: transactionOptions.psbtTx.txOutputs.map(
        (out) =>
          ({
            amount: out.value,
            address: out.address,
            script_type: "PAYTOADDRESS",
          }) as any,
      ),
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

export default TrezorBitcoin;
