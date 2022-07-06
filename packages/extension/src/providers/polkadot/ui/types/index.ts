import { ToTokenData } from "@/ui/action/types/token";

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
