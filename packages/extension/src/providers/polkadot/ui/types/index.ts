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
  chainName: `0x${string}`;
  from: `0x${string}`;
  value: `0x${string}`;
  to: `0x${string}`;
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
