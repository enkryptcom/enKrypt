import { BaseNetwork } from "@/types/base-network";
import { ToTokenData } from "@/ui/action/types/token";
import { EnkryptAccount } from "@enkryptcom/types";
import { ExtrinsicPayload } from "@polkadot/types/interfaces";

export interface CallData {
  method?: string;
  section?: string;
  args?: any;
}

export interface TxFeeInfo {
  nativeValue: string;
  fiatValue: string;
  nativeSymbol: string;
  fiatSymbol: string;
}

export interface SendTransactionDataType {
  from: string;
  value: string;
  to: string;
  data: `0x${string}`;
}

export interface VerifyTransactionParams {
  fromAddress: string;
  fromAddressName: string;
  toAddress: string;
  toToken: ToTokenData;
  txFee: TxFeeInfo;
  TransactionData: SendTransactionDataType;
}

export interface SignerTransactionOptions {
  payload: ExtrinsicPayload;
  network: BaseNetwork;
  account: EnkryptAccount;
}

export interface SignerMessageOptions {
  payload: Buffer;
  account: EnkryptAccount;
}

export interface PalletBalancesAccountData {
  free: string;
  reserved: string;
  miscFrozen: string;
  feeFrozen: string;
}

export interface FrameSystemAccountInfo {
  nonce: string;
  consumers: string;
  providers: string;
  sufficients: string;
  data: PalletBalancesAccountData;
}
