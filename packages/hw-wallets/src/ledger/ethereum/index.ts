import type Transport from "@ledgerhq/hw-transport";
import webUsbTransport from "@ledgerhq/hw-transport-webusb";
import ledgerService from "@ledgerhq/hw-app-eth/lib/services/ledger";
import { HWwalletCapabilities, NetworkNames } from "@enkryptcom/types";
import EthApp from "@ledgerhq/hw-app-eth";
import { toRpcSig, publicToAddress } from "@ethereumjs/util";
import { LegacyTransaction, FeeMarketEIP1559Transaction } from "@ethereumjs/tx";
import HDKey from "hdkey";
import { bufferToHex, hexToBuffer } from "@enkryptcom/utils";
import { RLP } from "@ethereumjs/rlp";
import {
  AddressResponse,
  getAddressRequest,
  HWWalletProvider,
  PathType,
  SignMessageRequest,
  SignTransactionRequest,
} from "../../types";
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
          new Error("ledger-ethereum: webusb is not supported"),
        );
      }
    }
    return true;
  }

  async getAddress(options: getAddressRequest): Promise<AddressResponse> {
    if (!supportedPaths[this.network])
      return Promise.reject(new Error("ledger-ethereum: Invalid network name"));
    const isHardened = options.pathType.basePath.split("/").length - 1 === 2;
    const connection = new EthApp(this.transport);
    if (!isHardened) {
      if (!this.HDNodes[options.pathType.basePath]) {
        const rootPub = await connection.getAddress(
          options.pathType.basePath,
          options.confirmAddress,
          true,
        );
        const hdKey = new HDKey();
        hdKey.publicKey = Buffer.from(rootPub.publicKey, "hex");
        hdKey.chainCode = Buffer.from(rootPub.chainCode, "hex");
        this.HDNodes[options.pathType.basePath] = hdKey;
      }
      const pubkey = this.HDNodes[options.pathType.basePath].derive(
        `m/${options.pathIndex}`,
      ).publicKey;
      return {
        address: bufferToHex(publicToAddress(pubkey, true)),
        publicKey: bufferToHex(pubkey),
      };
    }

    return connection
      .getAddress(
        options.pathType.path.replace(`{index}`, options.pathIndex),
        options.confirmAddress,
      )
      .then((res) => ({
        address: res.address.toLowerCase(),
        publicKey: `0x${res.publicKey}`,
      }));
  }

  signPersonalMessage(options: SignMessageRequest): Promise<string> {
    const connection = new EthApp(this.transport);
    return connection
      .signPersonalMessage(
        options.pathType.path.replace(`{index}`, options.pathIndex),
        options.message.toString("hex"),
      )
      .then((result) => `0x${result.r}${result.s}${result.v.toString(16)}`);
  }

  async signTransaction(options: SignTransactionRequest): Promise<string> {
    const connection = new EthApp(this.transport);
    let tx: LegacyTransaction | FeeMarketEIP1559Transaction;
    let msgToSign: string;
    if ((options.transaction as LegacyTransaction).gasPrice) {
      tx = options.transaction as LegacyTransaction;
      msgToSign = bufferToHex(RLP.encode(tx.getMessageToSign()), true);
    } else {
      tx = options.transaction as FeeMarketEIP1559Transaction;
      msgToSign = bufferToHex(tx.getMessageToSign(), true);
    }
    const resolution = await ledgerService.resolveTransaction(
      msgToSign,
      {},
      {},
    );
    return connection
      .signTransaction(
        options.pathType.path.replace(`{index}`, options.pathIndex),
        msgToSign,
        resolution,
      )
      .then((result) => {
        if ((tx as LegacyTransaction).gasPrice) {
          const rv = BigInt(parseInt(result.v, 16));
          const cv = tx.common.chainId() * 2n + 35n;
          return toRpcSig(
            rv - cv,
            hexToBuffer(result.r),
            hexToBuffer(result.s),
          );
        }
        return toRpcSig(
          BigInt(`0x${result.v}`),
          hexToBuffer(result.r),
          hexToBuffer(result.s),
        );
      });
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
    return [
      HWwalletCapabilities.eip1559,
      HWwalletCapabilities.signMessage,
      HWwalletCapabilities.signTx,
    ];
  }
}

export default LedgerEthereum;
