import type { ToTokenData } from '@/ui/action/types/token';
import type { GasFeeInfo, GasPriceTypes } from '@/providers/common/types';
import type { NFTItemWithCollectionName } from '@/types/nft';
import { EnkryptAccount } from '@enkryptcom/types';
import { BaseNetwork } from '@/types/base-network';

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
  signatureType: 'ed25519';
}

export interface SolSignTransactionRequest {
  hex: string;
  address: string;
  chain?: string;
}

export interface SolInternalSignTransactionRequest {
  transaction: Buffer;
  account: EnkryptAccount;
  network: BaseNetwork;
}

export interface SolInternalSignMessageRequest {
  payload: string;
  account: EnkryptAccount;
  network: BaseNetwork;
}
