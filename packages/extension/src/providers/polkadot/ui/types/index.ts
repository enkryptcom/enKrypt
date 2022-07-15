import { BaseNetwork } from "@/types/base-network";
import { InternalOnMessageResponse } from "@/types/messenger";
import { ToTokenData } from "@/ui/action/types/token";
import { EnkryptAccount, RPCRequestType } from "@enkryptcom/types";
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

export interface SignerOptions {
  payload: ExtrinsicPayload;
  network: BaseNetwork;
  account: EnkryptAccount;
  sendToBackground: (req: RPCRequestType) => Promise<InternalOnMessageResponse>;
}
