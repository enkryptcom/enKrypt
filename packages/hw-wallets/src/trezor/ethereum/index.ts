import { HWwalletCapabilities, NetworkNames } from "@enkryptcom/types";
import HDKey from "hdkey";
import { bigIntToHex, bufferToHex, hexToBuffer } from "@enkryptcom/utils";
import { publicToAddress, toRpcSig } from "@ethereumjs/util";
import { FeeMarketEIP1559Transaction, LegacyTransaction } from "@ethereumjs/tx";
import type { TrezorConnect } from "@trezor/connect-web";
import transformTypedData from "@trezor/connect-plugin-ethereum";
import {
  AddressResponse,
  getAddressRequest,
  HWWalletProvider,
  PathType,
  SignMessageRequest,
  SignTransactionRequest,
  SignTypedMessageRequest,
} from "../../types";
import { networkBasedSupportedPaths } from "./configs";
import getTrezorConnect from "../trezorConnect";

class TrezorEthereum implements HWWalletProvider {
  network: NetworkNames;
  TrezorConnect: TrezorConnect;
  HDNodes: Record<string, HDKey>;
  isExtension: boolean;

  constructor(network: NetworkNames) {
    this.network = network;
    this.HDNodes = {};
    this.isExtension = !!(
      chrome && chrome.runtime && chrome.runtime.getPlatformInfo
    );
  }

  async init(): Promise<boolean> {
    this.TrezorConnect = await getTrezorConnect();
    return true;
  }

  async getAddress(options: getAddressRequest): Promise<AddressResponse> {
    if (this.isExtension && !networkBasedSupportedPaths[this.network])
      return Promise.reject(new Error("trezor-ethereum: Invalid network name"));

    if (!this.HDNodes[options.pathType.basePath]) {
      const rootPub = await this.TrezorConnect.ethereumGetPublicKey({
        path: options.pathType.basePath,
        showOnTrezor: options.confirmAddress,
      });
      if (!rootPub.payload) {
        throw new Error("popup failed to open");
      }
      if (!rootPub.success) throw new Error((rootPub.payload as any).error);

      const hdKey = new HDKey();
      hdKey.publicKey = Buffer.from(rootPub.payload.publicKey, "hex");
      hdKey.chainCode = Buffer.from(rootPub.payload.chainCode, "hex");
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

  getSupportedPaths(): PathType[] {
    return this.isExtension ? networkBasedSupportedPaths[this.network] : [];
  }

  close(): Promise<void> {
    return Promise.resolve();
  }

  isConnected(): Promise<boolean> {
    return Promise.resolve(true);
  }

  async signPersonalMessage(options: SignMessageRequest): Promise<string> {
    const result = await this.TrezorConnect.ethereumSignMessage({
      path: options.pathType.path.replace(`{index}`, options.pathIndex),
      message: options.message.toString("hex"),
      hex: true,
    });
    if (!result.success) throw new Error((result.payload as any).error);
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
      return this.TrezorConnect.ethereumSignTransaction({
        path: options.pathType.path.replace(`{index}`, options.pathIndex),
        transaction: { ...txObject, gasPrice: bigIntToHex(tx.gasPrice) },
      }).then((result) => {
        if (!result.success) throw new Error((result.payload as any).error);
        const rv = BigInt(parseInt(result.payload.v, 16));
        const cv = tx.common.chainId() * 2n + 35n;
        return toRpcSig(
          rv - cv,
          hexToBuffer(result.payload.r),
          hexToBuffer(result.payload.s),
        );
      });
    }

    tx = options.transaction as FeeMarketEIP1559Transaction;
    return this.TrezorConnect.ethereumSignTransaction({
      path: options.pathType.path.replace(`{index}`, options.pathIndex),
      transaction: {
        ...txObject,
        maxFeePerGas: bigIntToHex(tx.maxFeePerGas),
        maxPriorityFeePerGas: bigIntToHex(tx.maxPriorityFeePerGas),
      },
    }).then((result) => {
      if (!result.success) throw new Error((result.payload as any).error);
      return toRpcSig(
        BigInt(result.payload.v),
        hexToBuffer(result.payload.r),
        hexToBuffer(result.payload.s),
      );
    });
  }

  async signTypedMessage(request: SignTypedMessageRequest): Promise<string> {
    const eip712Data = {
      types: request.types,
      primaryType: request.primaryType,
      domain: request.domain,
      message: request.message,
    };
    const { domain_separator_hash, message_hash } = transformTypedData(
      eip712Data as any,
      true,
    );
    const result = await this.TrezorConnect.ethereumSignTypedData({
      path: request.pathType.path.replace(`{index}`, request.pathIndex),
      data: eip712Data as any,
      metamask_v4_compat: true,
      domain_separator_hash,
      message_hash,
    });
    if (!result.success) throw new Error((result.payload as any).error);
    return bufferToHex(hexToBuffer(result.payload.signature));
  }

  static getSupportedNetworks(): NetworkNames[] {
    return Object.keys(networkBasedSupportedPaths) as NetworkNames[];
  }

  static getCapabilities(): string[] {
    return [
      HWwalletCapabilities.eip1559,
      HWwalletCapabilities.signMessage,
      HWwalletCapabilities.signTx,
      HWwalletCapabilities.typedMessage,
    ];
  }
}

export default TrezorEthereum;
