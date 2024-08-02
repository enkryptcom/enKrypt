import { ToTokenData } from "@/ui/action/types/token";
import { EnkryptAccount } from "@enkryptcom/types";
import { GasFeeInfo, GasPriceTypes } from "@/providers/common/types";
import { SolanaNetwork } from "../types/sol-network";
import { NFTItemWithCollectionName } from "@/types/nft";

export interface SendTransactionDataType {
  from: `0x${string}`;
  value: `0x${string}`;
  to: `0x${string}`;
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
}
