import { ToTokenData } from "@/ui/action/types/token";
import { GasFeeInfo, GasPriceTypes } from "@/providers/common/types";
import { NFTItemWithCollectionName } from "@/types/nft";

export interface SendTransactionDataType {
  from: string;
  value: string;
  to: string;
  contract: string;
}

export interface VerifyTransactionParams {
  TransactionData: SendTransactionDataType;
  isNFT: boolean;
  NFTData?: NFTItemWithCollectionName;
  fromAddress: string;
  fromAddressName: string;
  toAddress: string;
  toToken: ToTokenData;
  gasFee: GasFeeInfo;
  gasPriceType: GasPriceTypes;
  encodedTx: string;
}
