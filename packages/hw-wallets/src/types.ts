import { NetworkNames, HWwalletNames } from "@enkryptcom/types";
import type { ExtrinsicPayload } from "@polkadot/types/interfaces";

export type WalletConfigs = Record<HWwalletNames, { isBackground: boolean }>;

export interface MessageResponse {
  result?: string;
  error?: any;
}

export enum HandlerMethods {
  getAddress = "getAddress",
}

export interface LedgerSignature {
  signature: `0x${string}`;
}

export interface PathType {
  path: string;
  basePath: string;
  label: string;
}

export interface BaseRequest {
  pathIndex: string;
  pathType: PathType;
  wallet: HWwalletNames;
  networkName: NetworkNames;
}
export interface SignRequest extends BaseRequest {
  message: Buffer;
}
export interface getAddressRequest extends BaseRequest {
  confirmAddress: boolean;
}

export interface isConnectedRequest {
  wallet: HWwalletNames;
  networkName: NetworkNames;
}

export interface LedgerSignTransactionRequest
  extends Omit<SignRequest, "message"> {
  message: ExtrinsicPayload;
}

export abstract class HWWalletProvider {
  abstract network: NetworkNames;

  // eslint-disable-next-line no-useless-constructor,@typescript-eslint/no-unused-vars,@typescript-eslint/no-empty-function
  constructor(_network: NetworkNames) {}

  abstract init(): Promise<boolean>;

  abstract getAddress(options: getAddressRequest): Promise<string>;

  abstract getSupportedPaths(): PathType[];

  abstract isConnected(networkName: string): Promise<boolean>;

  abstract close(): Promise<void>;

  static getSupportedNetworks(): NetworkNames[] {
    return [];
  }
}
