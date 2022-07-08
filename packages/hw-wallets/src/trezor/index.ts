import TrezorConnect from "trezor-connect";
import { NetworkNames } from "@enkryptcom/types";
import HDKey from "hdkey";
import { bufferToHex } from "@enkryptcom/utils";
import { publicToAddress } from "ethereumjs-util";
import { getAddressRequest, HWWalletProvider, PathType } from "../types";
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

  async getAddress(options: getAddressRequest): Promise<string> {
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
    return bufferToHex(
      publicToAddress(
        this.HDNodes[options.pathType.basePath].derive(`m/${options.pathIndex}`)
          .publicKey,
        true
      )
    );
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

  static getSupportedNetworks(): NetworkNames[] {
    return Object.keys(supportedPaths) as NetworkNames[];
  }
}

export default TrezorEthereum;
