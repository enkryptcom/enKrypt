// @vitest-environment node
/**
 * Regression tests for the Solana transaction preview decoder.
 *
 * A malicious dApp could craft a transaction that first changes the owner
 * authority of the user's SPL token account (SetAuthority) and then drains it.
 * The old decoder filtered simulated accounts by *post-state* authority, so
 * accounts the user lost were silently dropped and the debit never rendered.
 * The decoder must reconcile pre-state ownership with simulated post-state and
 * flag authority changes / unverifiable accounts as security warnings.
 */
import { describe, it, expect, vi } from 'vitest';
import {
  Keypair,
  PublicKey,
  SystemProgram,
  Transaction,
  TransactionInstruction,
  TransactionMessage,
  VersionedTransaction,
} from '@solana/web3.js';
import { ACCOUNT_SIZE, TOKEN_PROGRAM_ID } from '@solana/spl-token';
import bs58 from 'bs58';
import { NATIVE_TOKEN_ADDRESS } from '@/providers/ethereum/libs/common';
import type { SolanaNetwork } from '../types/sol-network';

vi.mock('@/libs/market-data', () => ({
  default: class MarketDataMock {
    async getMarketData() {
      return [{ current_price: 0 }];
    }
    async getTokenValue() {
      return '0';
    }
  },
}));

import decodeTransaction from '../ui/libs/decode-tx';

const alice = Keypair.fromSeed(new Uint8Array(32).fill(1));
const mallory = Keypair.fromSeed(new Uint8Array(32).fill(2));
const mint = Keypair.fromSeed(new Uint8Array(32).fill(3)).publicKey;
const sourceTokenAccount = Keypair.fromSeed(new Uint8Array(32).fill(4)).publicKey;
const destTokenAccount = Keypair.fromSeed(new Uint8Array(32).fill(5)).publicKey;
const recentBlockhash = bs58.encode(Buffer.alloc(32, 9));
const AMOUNT = BigInt(42_000_000);

// SPL Token Account layout (165 bytes): mint(32) | owner(32) | amount u64 LE(8)
// | delegateOption(4) | delegate(32) | state(1) | isNativeOption(4) |
// isNative(8) | delegatedAmount(8) | closeAuthorityOption(4) | closeAuthority(32).
// Written manually because AccountLayout.encode trips over jsdom's Uint8Array realm.
const encodeTokenAccount = (owner: PublicKey, amount: bigint): Buffer => {
  const buf = Buffer.alloc(ACCOUNT_SIZE);
  Buffer.from(mint.toBytes()).copy(buf, 0);
  Buffer.from(owner.toBytes()).copy(buf, 32);
  buf.writeBigUInt64LE(amount, 64);
  buf.writeUInt8(1, 108); // state: initialized
  return buf;
};

interface SimAccount {
  owner: string;
  data: [string, string];
  lamports: number;
}

const preTokenInfo = (owner: PublicKey, amount: bigint) => ({
  owner: TOKEN_PROGRAM_ID,
  data: encodeTokenAccount(owner, amount),
  lamports: 2_039_280,
  executable: false,
});

const postTokenAccount = (owner: PublicKey, amount: bigint): SimAccount => ({
  owner: TOKEN_PROGRAM_ID.toBase58(),
  data: [encodeTokenAccount(owner, amount).toString('base64'), 'base64'],
  lamports: 2_039_280,
});

const postNativeAccount = (lamports: number): SimAccount => ({
  owner: SystemProgram.programId.toBase58(),
  data: ['', 'base64'],
  lamports,
});

const buildV0Tx = (): VersionedTransaction => {
  const ix = new TransactionInstruction({
    programId: TOKEN_PROGRAM_ID,
    keys: [
      { pubkey: sourceTokenAccount, isSigner: false, isWritable: true },
      { pubkey: destTokenAccount, isSigner: false, isWritable: true },
    ],
    data: Buffer.alloc(0),
  });
  const message = new TransactionMessage({
    payerKey: alice.publicKey,
    recentBlockhash,
    instructions: [ix],
  }).compileToV0Message();
  return new VersionedTransaction(message);
};

const buildLegacyTx = (): Transaction => {
  const tx = new Transaction({
    feePayer: alice.publicKey,
    blockhash: recentBlockhash,
    lastValidBlockHeight: 1,
  });
  tx.add(
    new TransactionInstruction({
      programId: TOKEN_PROGRAM_ID,
      keys: [
        { pubkey: sourceTokenAccount, isSigner: false, isWritable: true },
        { pubkey: destTokenAccount, isSigner: false, isWritable: true },
      ],
      data: Buffer.alloc(0),
    }),
  );
  return tx;
};

const makeNetwork = (
  pre: Record<string, unknown>,
  post: Record<string, SimAccount | null>,
  balances: { contract: string; balance: string; value: string }[],
): SolanaNetwork => {
  const web3 = {
    getMultipleAccountsInfo: async (keys: PublicKey[]) =>
      keys.map(k => pre[k.toBase58()] ?? null),
    simulateTransaction: async (
      _tx: unknown,
      cfgOrSigners: { accounts: { addresses: string[] } } | undefined,
      includeAccounts?: PublicKey[],
    ) => {
      const addresses = includeAccounts
        ? includeAccounts.map(k => k.toBase58())
        : cfgOrSigners!.accounts.addresses;
      return {
        value: {
          err: null,
          accounts: addresses.map(a => post[a] ?? null),
        },
      };
    },
  };
  return {
    api: async () => ({
      api: {
        web3,
        getTokenInfo: async (contract: string) => ({
          name: 'TEST',
          symbol: 'TEST',
          decimals: 6,
          icon: '',
          contract,
        }),
      },
    }),
    getAllTokenInfo: async () => balances,
    coingeckoID: 'solana',
    decimals: 9,
    icon: '',
    currencyName: 'SOL',
    currencyNameLong: 'Solana',
    node: 'http://localhost',
  } as unknown as SolanaNetwork;
};

const defaultPre = () => ({
  [alice.publicKey.toBase58()]: {
    owner: SystemProgram.programId,
    data: Buffer.alloc(0),
    lamports: 1_000_000_000,
    executable: false,
  },
  [sourceTokenAccount.toBase58()]: preTokenInfo(alice.publicKey, AMOUNT),
  [destTokenAccount.toBase58()]: preTokenInfo(mallory.publicKey, BigInt(0)),
});

const defaultBalances = () => [
  { contract: NATIVE_TOKEN_ADDRESS, balance: '1000000000', value: '0' },
  { contract: mint.toBase58(), balance: AMOUNT.toString(), value: '0' },
];

describe('solana decode-tx pre/post token account reconciliation', () => {
  it('shows the full debit and a warning when SetAuthority removes ownership (attack case)', async () => {
    const post = {
      [alice.publicKey.toBase58()]: postNativeAccount(999_990_000),
      // authority flipped to mallory, balance drained
      [sourceTokenAccount.toBase58()]: postTokenAccount(mallory.publicKey, BigInt(0)),
      [destTokenAccount.toBase58()]: postTokenAccount(mallory.publicKey, AMOUNT),
    };
    const network = makeNetwork(defaultPre(), post, defaultBalances());
    const result = await decodeTransaction(buildV0Tx(), alice.publicKey, network, 0);
    expect(result).not.toBeNull();
    expect(result!.securityWarnings).toHaveLength(1);
    expect(result!.securityWarnings[0]).toContain('transfers ownership');
    const tokenRow = result!.tokens.find(t => t.contract === mint.toBase58());
    expect(tokenRow).toBeDefined();
    expect(tokenRow!.isNegative).toBe(true);
    expect(tokenRow!.change).toBe(Number(AMOUNT));
  });

  it('shows the debit without warnings for a normal user-authorized transfer (negative control)', async () => {
    const post = {
      [alice.publicKey.toBase58()]: postNativeAccount(999_990_000),
      [sourceTokenAccount.toBase58()]: postTokenAccount(alice.publicKey, BigInt(0)),
      [destTokenAccount.toBase58()]: postTokenAccount(mallory.publicKey, AMOUNT),
    };
    const network = makeNetwork(defaultPre(), post, defaultBalances());
    const result = await decodeTransaction(buildV0Tx(), alice.publicKey, network, 0);
    expect(result!.securityWarnings).toHaveLength(0);
    const tokenRow = result!.tokens.find(t => t.contract === mint.toBase58());
    expect(tokenRow!.isNegative).toBe(true);
    expect(tokenRow!.change).toBe(Number(AMOUNT));
  });

  it('shows the debit without blocking when the token account is closed (e.g. SOL unwrap)', async () => {
    const post = {
      [alice.publicKey.toBase58()]: postNativeAccount(1_001_990_000),
      [sourceTokenAccount.toBase58()]: null, // account closed post-tx
      [destTokenAccount.toBase58()]: postTokenAccount(mallory.publicKey, BigInt(0)),
    };
    const network = makeNetwork(defaultPre(), post, defaultBalances());
    const result = await decodeTransaction(buildV0Tx(), alice.publicKey, network, 0);
    expect(result!.securityWarnings).toHaveLength(0);
    const tokenRow = result!.tokens.find(t => t.contract === mint.toBase58());
    expect(tokenRow!.isNegative).toBe(true);
    expect(tokenRow!.change).toBe(Number(AMOUNT));
  });

  it('fails closed with a warning when a user-owned token account is unparseable post-simulation', async () => {
    const post = {
      [alice.publicKey.toBase58()]: postNativeAccount(999_990_000),
      [sourceTokenAccount.toBase58()]: {
        owner: TOKEN_PROGRAM_ID.toBase58(),
        data: [Buffer.alloc(10).toString('base64'), 'base64'],
        lamports: 2_039_280,
      } as SimAccount,
      [destTokenAccount.toBase58()]: postTokenAccount(mallory.publicKey, AMOUNT),
    };
    const network = makeNetwork(defaultPre(), post, defaultBalances());
    const result = await decodeTransaction(buildV0Tx(), alice.publicKey, network, 0);
    expect(result!.securityWarnings).toHaveLength(1);
    expect(result!.securityWarnings[0]).toContain('could not verify');
  });

  it('still renders incoming credits for accounts the user owns post-state', async () => {
    const pre = {
      [alice.publicKey.toBase58()]: {
        owner: SystemProgram.programId,
        data: Buffer.alloc(0),
        lamports: 1_000_000_000,
        executable: false,
      },
      [sourceTokenAccount.toBase58()]: preTokenInfo(mallory.publicKey, AMOUNT),
      [destTokenAccount.toBase58()]: preTokenInfo(alice.publicKey, BigInt(0)),
    };
    const post = {
      [alice.publicKey.toBase58()]: postNativeAccount(999_990_000),
      [sourceTokenAccount.toBase58()]: postTokenAccount(mallory.publicKey, BigInt(0)),
      [destTokenAccount.toBase58()]: postTokenAccount(alice.publicKey, AMOUNT),
    };
    const balances = [
      { contract: NATIVE_TOKEN_ADDRESS, balance: '1000000000', value: '0' },
      { contract: mint.toBase58(), balance: '0', value: '0' },
    ];
    const network = makeNetwork(pre, post, balances);
    const result = await decodeTransaction(buildV0Tx(), alice.publicKey, network, 0);
    expect(result!.securityWarnings).toHaveLength(0);
    const tokenRow = result!.tokens.find(t => t.contract === mint.toBase58());
    expect(tokenRow!.isNegative).toBe(false);
    expect(tokenRow!.change).toBe(Number(AMOUNT));
  });

  it('detects the authority-change drain on legacy transactions too', async () => {
    const post = {
      [alice.publicKey.toBase58()]: postNativeAccount(999_990_000),
      [sourceTokenAccount.toBase58()]: postTokenAccount(mallory.publicKey, BigInt(0)),
      [destTokenAccount.toBase58()]: postTokenAccount(mallory.publicKey, AMOUNT),
    };
    const network = makeNetwork(defaultPre(), post, defaultBalances());
    const result = await decodeTransaction(
      buildLegacyTx(),
      alice.publicKey,
      network,
      'legacy',
    );
    expect(result!.securityWarnings).toHaveLength(1);
    expect(result!.securityWarnings[0]).toContain('transfers ownership');
    const tokenRow = result!.tokens.find(t => t.contract === mint.toBase58());
    expect(tokenRow!.isNegative).toBe(true);
    expect(tokenRow!.change).toBe(Number(AMOUNT));
  });
});
