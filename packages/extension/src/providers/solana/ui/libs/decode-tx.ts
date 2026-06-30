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
  }
  return (
    version !== 'legacy'
      ? solAPI.web3.simulateTransaction(tx as VersionedTransaction, {
          accounts: {
            addresses: accounts,
            encoding: 'base64',
          },
        })
      : solAPI.web3.simulateTransaction(tx as Transaction, undefined, true)
  ).then(async result => {
    if (result.value.err) return null;
    console.log(result.value);
    const nativeChange = {
      contract: NATIVE_TOKEN_ADDRESS,
      amount: BigInt(result.value.accounts![1]!.lamports),
    };
    const balanceChanges = result.value
      .accounts!.filter(a => {
        const data = Buffer.from(a!.data[0], 'base64');
        return (
          (a!.owner === TOKEN_PROGRAM_ID.toBase58() ||
            a!.owner === TOKEN_2022_PROGRAM_ID.toBase58()) &&
          data.length >= ACCOUNT_SIZE
        );
      })
      .map(a => {
        const data = Buffer.from(a!.data[0], 'base64');
        return AccountLayout.decode(data);
      })
      .filter(val => val.owner.toBase58() === from.toBase58())
      .map(val => {
        return {
          contract: val.mint.toBase58(),
          amount: val.amount,
        };
      });
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
        res.change = toBN(token.amount.toString()).toNumber();
        res.isNegative = false;
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
    return retVal;
  });
};

export default decodeTransaction;
