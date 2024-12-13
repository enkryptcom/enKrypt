import { BaseNetwork } from '@/types/base-network';
import { ToTokenData } from '@/ui/action/types/token';
import { EnkryptAccount } from '@enkryptcom/types';

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
  chainId: string;
  toAddress: string;
  toToken: ToTokenData;
  txFee: TxFeeInfo;
  TransactionData: SendTransactionDataType;
}

export interface SignerTransactionOptions {
  payload: string;
  network: BaseNetwork;
  account: EnkryptAccount;
}
