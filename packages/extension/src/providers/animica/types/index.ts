import { BaseNetwork, BaseNetworkOptions } from '@/types/base-network';
import { ToTokenData } from '@/ui/action/types/token';
import { Activity } from '@/types/activity';

export interface AnimicaNetworkOptions extends BaseNetworkOptions {
  chainId: number;
  /** 0x-prefixed 32-byte genesis hash; part of the signing domain. */
  genesisHash: string;
  /** Fork id; part of the signing domain. */
  forkId: number;
  /** Explorer REST base URL used for transaction history. */
  explorerApi: string;
  activityHandler?: (
    network: BaseNetwork,
    address: string,
  ) => Promise<Activity[]>;
}

export interface TxFeeInfo {
  nativeValue: string;
  fiatValue: string;
  nativeSymbol: string;
  fiatSymbol: string;
}

export interface VerifyTransactionParams {
  fromAddress: string;
  fromAddressName: string;
  toAddress: string;
  toToken: ToTokenData;
  txFee: TxFeeInfo;
  /** nANM per gas unit, quoted when the transaction was prepared. */
  gasPrice: string;
  gasLimit: number;
}
