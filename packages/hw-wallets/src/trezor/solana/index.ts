import type { TrezorConnect } from "@trezor/connect-web";
import { HWwalletCapabilities, NetworkNames } from "@enkryptcom/types";
import HDKey from "hdkey";
import base58 from "bs58";
import { bufferToHex } from "@enkryptcom/utils";
import {
  AddressResponse,
  getAddressRequest,
  HWWalletProvider,
  PathType,
  SignTransactionRequest,
  SolSignTransaction,
} from "../../types";
import { supportedPaths } from "./configs";
import getTrezorConnect from "../trezorConnect";

class TrezorSolana implements HWWalletProvider {
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
      return Promise.reject(new Error("trezor-solana: Invalid network name"));
    const res = await this.TrezorConnect.solanaGetAddress({
      path: options.pathType.path.replace(`{index}`, options.pathIndex),
      showOnTrezor: options.confirmAddress,
    });
    return {
      address: bufferToHex(base58.decode((res.payload as any).address)),
      publicKey: bufferToHex(base58.decode((res.payload as any).address)),
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

  async signPersonalMessage(): Promise<string> {
    throw new Error("trezor-solana: message signing not supported");
  }

  async signTransaction(options: SignTransactionRequest): Promise<string> {
    return this.TrezorConnect.solanaSignTransaction({
      path: options.pathType.path.replace(`{index}`, options.pathIndex),
      serializedTx: (options.transaction as SolSignTransaction).solTx.toString(
        "hex",
      ),
    }).then((result) => (result.payload as any).signature);
  }

  static getSupportedNetworks(): NetworkNames[] {
    return Object.keys(supportedPaths) as NetworkNames[];
  }

  static getCapabilities(): string[] {
    return [HWwalletCapabilities.signTx];
  }
}

export default TrezorSolana;
