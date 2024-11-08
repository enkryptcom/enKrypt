import type { SolanaSignInInput } from '@solana/wallet-standard-features';
import type { SendOptions } from '@solana/web3.js';
import {
  SolSignInResponse,
  SolSignTransactionRequest,
} from '@/providers/solana/ui/types';

export interface EnkryptEvent {
  connect(...args: unknown[]): unknown;
  disconnect(...args: unknown[]): unknown;
  accountsChanged(...args: unknown[]): unknown;
}

export interface EnkryptSolAccount {
  address: string;
  pubkey: string;
}

export interface EnkryptEventEmitter {
  on<E extends keyof EnkryptEvent>(
    event: E,
    listener: EnkryptEvent[E],
    context?: any,
  ): void;
  off<E extends keyof EnkryptEvent>(
    event: E,
    listener: EnkryptEvent[E],
    context?: any,
  ): void;
}

export interface Enkrypt extends EnkryptEventEmitter {
  accounts: EnkryptSolAccount[];
  connect(options?: { onlyIfTrusted?: boolean }): Promise<EnkryptSolAccount[]>;
  disconnect(): Promise<void>;
  signAndSendTransaction(
    transaction: SolSignTransactionRequest,
    options?: SendOptions,
  ): Promise<string>;
  signTransaction(transaction: SolSignTransactionRequest): Promise<string>;
  signMessage(options: {
    address: string;
    message: string;
  }): Promise<SolSignInResponse>;
  signIn(input?: SolanaSignInInput): Promise<SolSignInResponse>;
}
