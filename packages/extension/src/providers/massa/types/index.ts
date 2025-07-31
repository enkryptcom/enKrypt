import { NetworkName, CHAIN_ID } from '@massalabs/massa-web3';
import { BaseNetworkOptions } from '@/types/base-network';
import { ToTokenData } from '@/ui/action/types/token';
import { BaseNetwork } from '@/types/base-network';
import { Activity } from '@/types/activity';

export const MassaNetworks = NetworkName;

export interface MassaNetworkOptions extends BaseNetworkOptions {
  chainId?: (typeof CHAIN_ID)[keyof typeof CHAIN_ID];
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
  toTokenAddress?: string;
  txFee: TxFeeInfo;
}
