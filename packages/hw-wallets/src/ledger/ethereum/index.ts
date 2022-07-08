import type Transport from "@ledgerhq/hw-transport";
import webUsbTransport from "@ledgerhq/hw-transport-webusb";
import { NetworkNames } from "@enkryptcom/types";
import EthApp from "@ledgerhq/hw-app-eth";
import HDKey from "hdkey";
import { publicToAddress } from "ethereumjs-util";
import { bufferToHex } from "@enkryptcom/utils";
import { getAddressRequest, HWWalletProvider, PathType } from "../../types";
import { supportedPaths } from "./configs";
import ConnectToLedger from "../ledgerConnect";

class LedgerEthereum implements HWWalletProvider {
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
          new Error("ledger-ethereum: webusb is not supported")
        );
      }
    }
    return true;
  }

  async getAddress(options: getAddressRequest): Promise<string> {
    if (!supportedPaths[this.network])
      return Promise.reject(new Error("ledger-ethereum: Invalid network name"));
    const isHardened = options.pathType.basePath.split("/").length - 1 === 2;
    const connection = new EthApp(this.transport);
    if (!isHardened) {
      if (!this.HDNodes[options.pathType.basePath]) {
        const rootPub = await connection.getAddress(
          options.pathType.basePath,
          options.confirmAddress,
          true
        );
        const hdKey = new HDKey();
        hdKey.publicKey = Buffer.from(rootPub.publicKey, "hex");
        hdKey.chainCode = Buffer.from(rootPub.chainCode, "hex");
        this.HDNodes[options.pathType.basePath] = hdKey;
      }
      return bufferToHex(
        publicToAddress(
          this.HDNodes[options.pathType.basePath].derive(
            `m/${options.pathIndex}`
          ).publicKey,
          true
        )
      );
    }
    return connection
      .getAddress(
        options.pathType.path.replace(`{index}`, options.pathIndex),
        options.confirmAddress
      )
      .then((res) => res.address);
  }

  signMessage() {
    throw new Error("Not Supported");
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
}

export default LedgerEthereum;
