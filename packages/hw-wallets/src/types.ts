import { NetworkNames } from "@enkryptcom/types";
import type { ExtrinsicPayload } from "@polkadot/types/interfaces";

export enum WalletType {
  ledger = "ledger",
}
export interface TransportMessage {
  wallet: WalletType;
  msg: `0x${string}`;
}
export interface LedgerSignature {
  signature: `0x${string}`;
}
export interface SignRequest {
  message: Buffer;
  path: string;
  networkName: NetworkNames;
}
export interface getAddressRequest {
  confirmAddress: boolean;
  path: string;
  networkName: NetworkNames;
}

export interface LedgerSignTransactionRequest
  extends Omit<SignRequest, "message"> {
  message: ExtrinsicPayload;
}
