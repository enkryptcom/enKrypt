import { GasPriceTypes } from '@/providers/common/types';
import { NFTItemWithCollectionName } from '@/types/nft';
import { ToTokenData } from '@/ui/action/types/token';
import { EnkryptAccount } from '@enkryptcom/types';
import { BitcoinNetwork } from '../types/bitcoin-network';

export interface GasFeeInfo {
  nativeValue: string;
  fiatValue: string;
  nativeSymbol: string;
  fiatSymbol: string;
}
export interface BTCTxInfo {
  inputs: any[];
  outputs: { address: string; value: number }[];
}
export interface GasFeeType {
  [GasPriceTypes.ECONOMY]: GasFeeInfo;
  [GasPriceTypes.REGULAR]: GasFeeInfo;
  [GasPriceTypes.FAST]: GasFeeInfo;
  [GasPriceTypes.FASTEST]: GasFeeInfo;
}

export interface VerifyTransactionParams {
  isNFT: boolean;
  NFTData?: NFTItemWithCollectionName;
  fromAddress: string;
  fromAddressName: string;
  toAddress: string;
  toToken: ToTokenData;
  gasFee: GasFeeInfo;
  gasPriceType: GasPriceTypes;
  TxInfo: string;
  mnemonic?: string;
}

export interface SignerTransactionOptions {
  payload: BTCTxInfo;
  network: BitcoinNetwork;
  account: EnkryptAccount;
}

export interface SignerMessageOptions {
  payload: Buffer;
  network: BitcoinNetwork;
  account: EnkryptAccount;
  type: string;
}
