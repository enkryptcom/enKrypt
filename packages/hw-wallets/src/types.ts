import { NetworkNames, HWwalletType } from "@enkryptcom/types";
import type {
  FeeMarketEIP1559Transaction,
  LegacyTransaction,
} from "@ethereumjs/tx";
import type { ExtrinsicPayload } from "@polkadot/types/interfaces";
import type { Psbt, Transaction } from "bitcoinjs-lib";

export type WalletConfigs = Record<HWwalletType, { isBackground: boolean }>;

export interface MessageResponse {
  result?: string;
  error?: any;
}

// eslint-disable-next-line no-shadow
export enum HandlerMethods {
  getAddress = "getAddress",
}

export interface LedgerSignature {
  signature: `0x${string}`;
}

export interface PathType {
  path: string;
  basePath: string;
  label?: string;
}

export interface AddressResponse {
  address: string;
  publicKey: string;
}

export interface BaseRequest {
  pathIndex: string;
  pathType: PathType;
  wallet: HWwalletType;
  networkName: NetworkNames;
}

export interface GenericSignMessage extends BaseRequest {
  message: Buffer;
}

export interface BitcoinSignMessage extends BaseRequest {
  message: Buffer;
  type: "bip322-simple" | "classic";
  psbtTx?: Psbt;
  inputTx?: Transaction;
}

export type SignMessageRequest = GenericSignMessage | BitcoinSignMessage;

export interface BTCSignTransaction {
  rawTxs: string[];
  psbtTx: Psbt;
}

export interface SolSignTransaction {
  solTx: Buffer;
}

export interface SignTransactionRequest extends BaseRequest {
  transaction:
    | FeeMarketEIP1559Transaction
    | LegacyTransaction
    | ExtrinsicPayload
    | BTCSignTransaction
    | SolSignTransaction;
}

export interface getAddressRequest extends BaseRequest {
  confirmAddress: boolean;
}

export interface isConnectedRequest {
  wallet: HWwalletType;
  networkName: NetworkNames;
}

export abstract class HWWalletProvider {
  abstract network: NetworkNames;

  // eslint-disable-next-line no-useless-constructor,@typescript-eslint/no-unused-vars,@typescript-eslint/no-empty-function
  constructor(_network: NetworkNames) {}

  abstract init(): Promise<boolean>;

  abstract getAddress(options: getAddressRequest): Promise<AddressResponse>;

  abstract getSupportedPaths(): PathType[];

  abstract isConnected(networkName: string): Promise<boolean>;

  abstract close(): Promise<void>;

  abstract signPersonalMessage(request: SignMessageRequest): Promise<string>;

  abstract signTransaction(request: SignTransactionRequest): Promise<string>;

  static getSupportedNetworks(): NetworkNames[] {
    return [];
  }

  static getCapabilities(): string[] {
    return [];
  }
}
