import TrezorConnect from "@trezor/connect-web";
import { HWwalletCapabilities, NetworkNames } from "@enkryptcom/types";
import HDKey from "hdkey";
import { bigIntToHex, bufferToHex, hexToBuffer } from "@enkryptcom/utils";
import { publicToAddress, toRpcSig } from "ethereumjs-util";
import {
  FeeMarketEIP1559Transaction,
  Transaction as LegacyTransaction,
} from "@ethereumjs/tx";
import {
  AddressResponse,
  getAddressRequest,
  HWWalletProvider,
  PathType,
  SignMessageRequest,
  SignTransactionRequest,
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

  async signPersonalMessage(options: SignMessageRequest): Promise<string> {
    const result = await TrezorConnect.ethereumSignMessage({
      path: options.pathType.path.replace(`{index}`, options.pathIndex),
      message: options.message.toString("hex"),
      hex: true,
    });
    if (!result.success)
      throw new Error((result.payload as any).error as string);
    return bufferToHex(hexToBuffer(result.payload.signature));
  }

  async signTransaction(options: SignTransactionRequest): Promise<string> {
    let tx: LegacyTransaction | FeeMarketEIP1559Transaction =
      options.transaction as LegacyTransaction;

    const txObject = {
      to: tx.to.toString(),
      value: bigIntToHex(tx.value),
      chainId: Number(tx.common.chainId()),
      nonce: bigIntToHex(tx.nonce),
      gasLimit: bigIntToHex(tx.gasLimit),
      data: bufferToHex(tx.data),
    };
    if ((options.transaction as LegacyTransaction).gasPrice) {
      return TrezorConnect.ethereumSignTransaction({
        path: options.pathType.path.replace(`{index}`, options.pathIndex),
        transaction: {
          ...txObject,
          gasPrice: bigIntToHex(tx.gasPrice),
        },
      }).then((result) => {
        if (!result.success)
          throw new Error((result.payload as any).error as string);
        const rv = BigInt(parseInt(result.payload.v, 16));
        const cv = tx.common.chainId() * 2n + 35n;
        return toRpcSig(
          bigIntToHex(rv - cv),
          hexToBuffer(result.payload.r),
          hexToBuffer(result.payload.s)
        );
      });
    }

    tx = options.transaction as FeeMarketEIP1559Transaction;
    return TrezorConnect.ethereumSignTransaction({
      path: options.pathType.path.replace(`{index}`, options.pathIndex),
      transaction: {
        ...txObject,
        maxFeePerGas: bigIntToHex(tx.maxFeePerGas),
        maxPriorityFeePerGas: bigIntToHex(tx.maxPriorityFeePerGas),
      },
    }).then((result) => {
      if (!result.success)
        throw new Error((result.payload as any).error as string);
      return toRpcSig(
        result.payload.v,
        hexToBuffer(result.payload.r),
        hexToBuffer(result.payload.s)
      );
    });
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
