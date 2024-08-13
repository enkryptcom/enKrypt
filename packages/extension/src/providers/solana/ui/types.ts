import type { ToTokenData } from "@/ui/action/types/token";
import type { GasFeeInfo, GasPriceTypes } from "@/providers/common/types";
import type { NFTItemWithCollectionName } from "@/types/nft";

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

export interface SolSignInResponse {
  address: string;
  pubkey: string;
  signature: string;
  signedMessage: string;
  signatureType: "ed25519";
}

export interface SolSignTransactionRequest {
  hex: string;
  address: string;
  chain?: string;
}
