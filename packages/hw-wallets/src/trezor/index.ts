import TrezorConnect from "trezor-connect";
import { NetworkNames } from "@enkryptcom/types";
import { getAddressRequest, HWWalletProvider } from "../types";
import { supportedPaths } from "./configs";

class TrezorEthereum implements HWWalletProvider {
  network: NetworkNames;

  constructor(network: NetworkNames) {
    this.network = network;
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
    return TrezorConnect.ethereumGetAddress({
      path: options.path,
      showOnTrezor: options.confirmAddress,
    }).then((result) => {
      if (result.success) return result.payload.address;
      throw new Error((result.payload as any).error as string);
    });
  }

  signMessage() {
    throw new Error("Not Supported");
  }

  getSupportedPaths(): string[] {
    return supportedPaths[this.network];
  }

  static getSupportedNetworks(): NetworkNames[] {
    return Object.keys(supportedPaths) as NetworkNames[];
  }
}

export default TrezorEthereum;
