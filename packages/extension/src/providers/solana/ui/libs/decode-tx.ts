import { NATIVE_TOKEN_ADDRESS } from '@/providers/ethereum/libs/common';
import {
  ACCOUNT_SIZE,
  AccountLayout,
  TOKEN_2022_PROGRAM_ID,
  TOKEN_PROGRAM_ID,
} from '@solana/spl-token';
import {
  VersionedTransaction,
  PublicKey,
  Transaction,
  TransactionVersion,
  AddressLookupTableProgram,
  AddressLookupTableAccount,
  AccountInfo,
} from '@solana/web3.js';
import SolanaAPI from '@/providers/solana/libs/api';
import { SolanaNetwork } from '../../types/sol-network';
import { toBN } from 'web3-utils';
import BigNumber from 'bignumber.js';
import { fromBase } from '@enkryptcom/utils';
import MarketData from '@/libs/market-data';

export interface DecodedTxResponseType {
  contract: string;
  decimals: number;
  icon: string;
  change: number;
  isNegative: boolean;
  name: string;
  symbol: string;
  USDval: string;
  price: string;
}

export interface DecodedTxResultType {
  tokens: DecodedTxResponseType[];
  securityWarnings: string[];
}

/** Post-simulation state of an account referenced by the transaction. */
type PostTokenState =
  | { status: 'token'; authority: string; mint: string; amount: bigint }
  | { status: 'closed' }
  | { status: 'unparseable' };
const assetFetch = (
  node: string,
  method: string,
  params: any,
): Promise<any> => {
  return fetch(node, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      jsonrpc: '2.0',
      id: 'rpd-op-123',
      method,
      params,
    }),
  }).then(res => res.json());
};

export async function fetchRelevantAddresses(
  solAPI: SolanaAPI,
  lookupTableKeys: PublicKey[],
  relevantIndexes: Set<number>,
): Promise<PublicKey[]> {
  const relevantAddresses: PublicKey[] = [];

  for (const key of lookupTableKeys) {
    const accountInfo = await solAPI.web3.getAccountInfo(key);
    if (
      accountInfo?.data &&
      accountInfo.owner.equals(AddressLookupTableProgram.programId)
    ) {
      try {
        const lookupTableAccount = AddressLookupTableAccount.deserialize(
          accountInfo.data,
        );
        if (lookupTableAccount && lookupTableAccount.addresses) {
          // FIX: awaited for-loop instead of forEach(async …)
          for (
            let index = 0;
            index < lookupTableAccount.addresses.length;
            index++
          ) {
            const address = lookupTableAccount.addresses[index];
            if (!relevantIndexes.has(index)) continue;

            const addressInfo = await solAPI.web3.getAccountInfo(address);
            if (
              (addressInfo?.owner.toBase58() === TOKEN_PROGRAM_ID.toBase58() ||
                addressInfo?.owner.toBase58() ===
                  TOKEN_2022_PROGRAM_ID.toBase58()) &&
              addressInfo.data.length >= ACCOUNT_SIZE
            ) {
              relevantAddresses.push(address);
            }
          }
        }
      } catch {
        console.error('Failed to deserialize address lookup table account');
      }
    }
  }

  return relevantAddresses;
}

const decodeTransaction = async (
  tx: VersionedTransaction | Transaction,
  from: PublicKey,
  network: SolanaNetwork,
  version: TransactionVersion,
) => {
  const solAPI = (await network.api()).api as SolanaAPI;
  const allBalances = await network.getAllTokenInfo(from.toBase58());
  const marketData = new MarketData();
  let accounts: string[] = [];
  if (version !== 'legacy') {
    const relevantIndexes = new Set<number>();

    // Retrieve addresses from the LUTs and the message
    const addressTableLookupKeys = (
      tx as VersionedTransaction
    ).message.addressTableLookups.map(
      lookup => new PublicKey(lookup.accountKey),
    );

    (tx as VersionedTransaction).message.addressTableLookups.forEach(lookup => {
      lookup.writableIndexes.forEach(index => relevantIndexes.add(index));
      lookup.readonlyIndexes.forEach(index => relevantIndexes.add(index));
    });

    const lookupTableAccounts = await fetchRelevantAddresses(
      solAPI,
      addressTableLookupKeys,
      relevantIndexes,
    );

    accounts = [
      ...(tx as VersionedTransaction).message.staticAccountKeys.map(k =>
        k.toBase58(),
      ),
      ...lookupTableAccounts.map(k => k.toBase58()),
    ];
  } else {
    accounts = (tx as Transaction)
      .compileMessage()
      .accountKeys.map(k => k.toBase58());
  }
  const fromBase58 = from.toBase58();
  const accountKeys = accounts.map(a => new PublicKey(a));
  // Pre-state: token accounts referenced by the transaction that are
  // currently owned by the signer. These must be reconciled against the
  // simulated post-state so authority changes/closures still show the debit.
  const preOwnedTokenAccounts = new Map<
    string,
    { mint: string; amount: bigint }
  >();
  const preInfos: (AccountInfo<Buffer> | null)[] = [];
  for (let i = 0; i < accountKeys.length; i += 100) {
    preInfos.push(
      ...(await solAPI.web3.getMultipleAccountsInfo(
        accountKeys.slice(i, i + 100),
      )),
    );
  }
  preInfos.forEach((info, idx) => {
    if (!info) return;
    const ownerProgram = info.owner.toBase58();
    if (
      (ownerProgram === TOKEN_PROGRAM_ID.toBase58() ||
        ownerProgram === TOKEN_2022_PROGRAM_ID.toBase58()) &&
      info.data.length >= ACCOUNT_SIZE
    ) {
      try {
        // re-wrap so the data is a Buffer from this module's realm
        const decoded = AccountLayout.decode(Buffer.from(info.data));
        if (decoded.owner.toBase58() === fromBase58) {
          preOwnedTokenAccounts.set(accounts[idx], {
            mint: decoded.mint.toBase58(),
            amount: decoded.amount,
          });
        }
      } catch {
        // not a parseable token account: nothing owned by the signer here
      }
    }
  });
  return (
    version !== 'legacy'
      ? solAPI.web3.simulateTransaction(tx as VersionedTransaction, {
          accounts: {
            addresses: accounts,
            encoding: 'base64',
          },
        })
      : solAPI.web3.simulateTransaction(tx as Transaction, undefined, accountKeys)
  ).then(async result => {
    if (result.value.err) return null;
    console.log(result.value);
    const securityWarnings: string[] = [];
    const simAccounts = result.value.accounts ?? [];
    const fromIndex = accounts.indexOf(fromBase58);
    const nativeChange = {
      contract: NATIVE_TOKEN_ADDRESS,
      amount: BigInt(
        fromIndex !== -1 ? (simAccounts[fromIndex]?.lamports ?? 0) : 0,
      ),
    };
    const postStates = new Map<string, PostTokenState>();
    simAccounts.forEach((a, idx) => {
      const address = accounts[idx];
      if (!address) return;
      if (!a) {
        postStates.set(address, { status: 'closed' });
        return;
      }
      const isTokenAccount =
        a.owner === TOKEN_PROGRAM_ID.toBase58() ||
        a.owner === TOKEN_2022_PROGRAM_ID.toBase58();
      if (!isTokenAccount) {
        postStates.set(address, { status: 'closed' });
        return;
      }
      const data = Buffer.from(a.data[0], 'base64');
      if (data.length < ACCOUNT_SIZE) {
        postStates.set(address, { status: 'unparseable' });
        return;
      }
      try {
        const decoded = AccountLayout.decode(data);
        postStates.set(address, {
          status: 'token',
          authority: decoded.owner.toBase58(),
          mint: decoded.mint.toBase58(),
          amount: decoded.amount,
        });
      } catch {
        postStates.set(address, { status: 'unparseable' });
      }
    });
    // Post-state balances still owned by the signer, aggregated per mint.
    const postOwnedByMint = new Map<string, bigint>();
    postStates.forEach(state => {
      if (state.status === 'token' && state.authority === fromBase58) {
        postOwnedByMint.set(
          state.mint,
          (postOwnedByMint.get(state.mint) ?? BigInt(0)) + state.amount,
        );
      }
    });
    // Reconcile: every token account the signer owned before the transaction
    // must be accounted for, even if the simulated post-state no longer names
    // the signer as its authority (e.g. SetAuthority/CloseAccount drains).
    const preOwnedByMint = new Map<string, bigint>();
    preOwnedTokenAccounts.forEach((pre, address) => {
      preOwnedByMint.set(
        pre.mint,
        (preOwnedByMint.get(pre.mint) ?? BigInt(0)) + pre.amount,
      );
      const post = postStates.get(address);
      if (post && post.status === 'token' && post.authority === fromBase58)
        return;
      // the signer loses this account: force a row so the debit is rendered
      if (!postOwnedByMint.has(pre.mint))
        postOwnedByMint.set(pre.mint, BigInt(0));
      if (!post || post.status === 'unparseable') {
        securityWarnings.push(
          `Enkrypt could not verify the outcome of this transaction for your token account ${address}. Signing has been disabled for your protection.`,
        );
      } else if (post.status === 'token') {
        securityWarnings.push(
          `This transaction transfers ownership of your token account ${address} to another wallet, allowing it to drain the account. Signing has been disabled for your protection.`,
        );
      }
      // post.status === 'closed': account closed (e.g. unwrapping SOL);
      // the forced debit row above is enough, no warning necessary.
    });
    const balanceChanges = Array.from(postOwnedByMint.entries()).map(
      ([contract, amount]) => ({ contract, amount }),
    );
    const getTokenInfoPromises = await Promise.all(
      balanceChanges.map(val => {
        return solAPI.getTokenInfo(val.contract).then(info => {
          return {
            ...info,
            ...val,
          };
        });
      }),
    );
    getTokenInfoPromises.unshift({
      amount: nativeChange.amount,
      cgId: network.coingeckoID,
      contract: NATIVE_TOKEN_ADDRESS,
      decimals: network.decimals,
      icon: network.icon,
      name: network.currencyNameLong,
      symbol: network.currencyName,
    });
    const retVal: DecodedTxResponseType[] = [];
    for (const token of getTokenInfoPromises) {
      const res: DecodedTxResponseType = {
        change: 0,
        contract: token.contract,
        decimals: token.decimals,
        icon: token.icon || '',
        isNegative: false,
        name: token.name,
        symbol: token.symbol,
        price: '0',
        USDval: '0',
      };
      const balInfo = allBalances.find(b => b.contract === token.contract);
      if (balInfo) {
        const curBalance = toBN(balInfo.balance);
        const newBalance = toBN(token.amount.toString());
        const diff = newBalance.sub(curBalance).toNumber();
        res.change = Math.abs(diff);
        res.isNegative = diff < 0;
        res.USDval = new BigNumber(balInfo.value)
          .times(fromBase(res.change.toString(), res.decimals))
          .toString();
        res.price = balInfo.value;
      } else {
        const preAmount = preOwnedByMint.get(token.contract);
        if (preAmount !== undefined) {
          // mint unknown to the balance API: diff against the referenced
          // pre-state token accounts so drains are still rendered
          const diff = toBN(token.amount.toString())
            .sub(toBN(preAmount.toString()))
            .toNumber();
          res.change = Math.abs(diff);
          res.isNegative = diff < 0;
        } else {
          res.change = toBN(token.amount.toString()).toNumber();
          res.isNegative = false;
        }
        if (token.cgId) {
          const val = await marketData.getMarketData([token.cgId]);
          res.USDval = new BigNumber(val[0]!.current_price ?? 0)
            .times(fromBase(res.change.toString(), res.decimals))
            .toString();
          res.price = (val[0]!.current_price ?? 0).toString();
        }
      }
      if (token.decimals === 0) {
        const assetDetails = await assetFetch(network.node, 'getAsset', {
          id: token.contract,
        }).catch(() => {
          return null;
        });
        if (assetDetails) {
          res.icon = `https://img.mewapi.io/?image=${assetDetails.result.content.links.image}`;
          res.name = assetDetails.result.content.metadata.name;
          res.symbol = assetDetails.result.content.metadata.symbol;
        }
      }
      retVal.push(res);
    }
    retVal.sort(v => (v.isNegative ? -1 * v.change : v.change));
    return { tokens: retVal, securityWarnings };
  });
};

export default decodeTransaction;
