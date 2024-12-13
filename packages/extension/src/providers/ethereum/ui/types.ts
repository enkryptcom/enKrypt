import { BaseNetwork } from '@/types/base-network';
import type { ToTokenData } from '@/ui/action/types/token';
import { EnkryptAccount } from '@enkryptcom/types';
import { FeeMarketEIP1559Transaction, LegacyTransaction } from '@ethereumjs/tx';
import { GasPriceTypes } from '@/providers/common/types';
import type { GasFeeInfo } from '@/providers/common/types';
import type { NFTItemWithCollectionName } from '@/types/nft';

export interface SendTransactionDataType {
  chainId: `0x${string}`;
  from: `0x${string}`;
  value: `0x${string}`;
  to: `0x${string}`;
  data: `0x${string}`;
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
  TransactionData: SendTransactionDataType;
}

export interface SignerTransactionOptions {
  payload: FeeMarketEIP1559Transaction | LegacyTransaction;
  network: BaseNetwork;
  account: EnkryptAccount;
}

export interface SignerMessageOptions {
  payload: Buffer;
  network: BaseNetwork;
  account: EnkryptAccount;
}

export { GasFeeInfo };
