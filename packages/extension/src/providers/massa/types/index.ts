import { NetworkName} from '@massalabs/massa-web3';
import { BaseNetworkOptions } from '@/types/base-network';
import { CHAIN_ID } from '@massalabs/massa-web3';
import { ToTokenData } from '@/ui/action/types/token';
import { EnkryptAccount } from '@enkryptcom/types';
import { BaseNetwork } from '@/types/base-network';

export const MassaNetworks = NetworkName;

export interface MassaNetworkOptions extends BaseNetworkOptions {
  chainId?: typeof CHAIN_ID[keyof typeof CHAIN_ID];
}

export interface MassaRawInfo {
  hash: string;
  blockNumber: number;
  timestamp: number;
  from: string;
  to: string;
  value: string;
  status: boolean;
}

export interface MassaTransaction {
  fee: bigint;
  amount: bigint;
  recipientAddress: string;
}

export interface MassaMessage {
  id: string;
  sender: string;
  recipient: string;
  amount: string;
  data: string;
  timestamp: number;
  status: boolean;
}

export interface MassaSignInInput {
  address: string;
  privateKey: string;
}

export interface MassaSignInOutput {
  address: string;
  publicKey: string;
}

export interface MassaAccount{
  address: string;
  balance: string;
  activeRolls: number;
  candidateRolls: number;
}

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
  toAddress: string;
  toToken: ToTokenData;
  txFee: TxFeeInfo;
  TransactionData: SendTransactionDataType;
}

export interface SignerTransactionOptions {
  transaction: Buffer;
  account: EnkryptAccount;
  network: BaseNetwork;
}

export interface InjectedProvider {
  connect(): Promise<MassaAccount[]>;
  disconnect(): Promise<void>;
  signTransaction(transaction: MassaTransaction): Promise<string>;
  signMessage(message: string): Promise<string>;
  getAccounts(): Promise<string[]>;
  getBalance(address: string): Promise<string>;
  getNetwork(): Promise<string>;
  isConnected(): boolean;
} 