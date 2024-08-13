import type {
  SolanaSignInInput,
  SolanaSignInOutput,
} from "@solana/wallet-standard-features";
import type {
  SendOptions,
  Transaction,
  TransactionSignature,
  VersionedTransaction,
} from "@solana/web3.js";
import {
  SolSignInResponse,
  SolSignTransactionRequest,
} from "@/providers/solana/ui/types";

export interface EnkryptEvent {
  connect(...args: unknown[]): unknown;
  disconnect(...args: unknown[]): unknown;
  accountChanged(...args: unknown[]): unknown;
}

export interface EnkryptSolAccount {
  address: string;
  pubkey: string;
}

export interface EnkryptEventEmitter {
  on<E extends keyof EnkryptEvent>(
    event: E,
    listener: EnkryptEvent[E],
    context?: any
  ): void;
  off<E extends keyof EnkryptEvent>(
    event: E,
    listener: EnkryptEvent[E],
    context?: any
  ): void;
}

export interface Enkrypt extends EnkryptEventEmitter {
  accounts: EnkryptSolAccount[];
  connect(options?: { onlyIfTrusted?: boolean }): Promise<EnkryptSolAccount[]>;
  disconnect(): Promise<void>;
  signAndSendTransaction<T extends Transaction | VersionedTransaction>(
    transaction: T,
    options?: SendOptions
  ): Promise<{ signature: TransactionSignature }>;
  signTransaction(transaction: SolSignTransactionRequest): Promise<string>;
  signAllTransactions<T extends Transaction | VersionedTransaction>(
    transactions: T[]
  ): Promise<T[]>;
  signMessage(options: {
    address: string;
    message: string;
  }): Promise<SolSignInResponse>;
  signIn(input?: SolanaSignInInput): Promise<SolSignInResponse>;
}
