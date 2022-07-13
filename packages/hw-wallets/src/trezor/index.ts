import TrezorConnect from "trezor-connect";
import { HWwalletCapabilities, NetworkNames } from "@enkryptcom/types";
import HDKey from "hdkey";
import { bufferToHex, hexToBuffer } from "@enkryptcom/utils";
import { publicToAddress } from "ethereumjs-util";
import {
  AddressResponse,
  getAddressRequest,
  HWWalletProvider,
  PathType,
  SignRequest,
} from "../types";
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
      return Promise.reject(new Error("trezor-ethereum: Invalid network name"));

    if (!this.HDNodes[options.pathType.basePath]) {
      const rootPub = await TrezorConnect.ethereumGetPublicKey({
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
      address: bufferToHex(publicToAddress(pubkey, true)),
      publicKey: bufferToHex(pubkey),
    };
  }

  signMessage() {
    throw new Error("Not Supported");
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

  async signPersonalMessage(options: SignRequest): Promise<string> {
    const result = await TrezorConnect.ethereumSignMessage({
      path: options.pathType.path.replace(`{index}`, options.pathIndex),
      message: options.message.toString("hex"),
      hex: true,
    });
    if (!result.success)
      throw new Error((result.payload as any).error as string);
    return bufferToHex(hexToBuffer(result.payload.signature));
  }

  static getSupportedNetworks(): NetworkNames[] {
    return Object.keys(supportedPaths) as NetworkNames[];
  }

  static getCapabilities(): string[] {
    return [
      HWwalletCapabilities.eip1559,
      HWwalletCapabilities.signMessage,
      HWwalletCapabilities.signTx,
    ];
  }
}

export default TrezorEthereum;
