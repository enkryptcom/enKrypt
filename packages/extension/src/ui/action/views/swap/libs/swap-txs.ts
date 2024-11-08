import type Web3Eth from 'web3-eth';
import EvmAPI from '@/providers/ethereum/libs/api';
import { getNetworkByName } from '@/libs/utils/networks';
import {
  EVMTransaction,
  GenericTransaction,
  getNetworkInfoByName,
  NetworkType,
  SolanaTransaction as EnkryptSolanaTransaction,
  SupportedNetworkName,
} from '@enkryptcom/swap';
import { NetworkNames } from '@enkryptcom/types';
import Transaction from '@/providers/ethereum/libs/transaction';
import { EvmNetwork } from '@/providers/ethereum/types/evm-network';
import { SubstrateNativeToken } from '@/providers/polkadot/types/substrate-native-token';
import { SubstrateNetwork } from '@/providers/polkadot/types/substrate-network';
import { ApiPromise } from '@polkadot/api';
import { TransactionType } from '../types';
import { BitcoinNetwork } from '@/providers/bitcoin/types/bitcoin-network';
import BitcoinAPI from '@/providers/bitcoin/libs/api';
import { getTxInfo as getBTCTxInfo } from '@/providers/bitcoin/libs/utils';
import { toBN } from 'web3-utils';
import { BTCTxInfo } from '@/providers/bitcoin/ui/types';
import {
  VersionedTransaction as SolanaVersionedTransaction,
  Transaction as SolanaLegacyTransaction,
} from '@solana/web3.js';

export const getSubstrateNativeTransation = async (
  network: SubstrateNetwork,
  tx: GenericTransaction,
) => {
  const api = await network!.api();
  const fromToken = new SubstrateNativeToken({
    decimals: network.decimals,
    icon: network.icon,
    name: network.name,
    symbol: network.currencyName,
    existentialDeposit: (network as SubstrateNetwork).existentialDeposit,
    coingeckoID: network!.coingeckoID,
  });
  const txRes = await fromToken.send(api.api as ApiPromise, tx.to, tx.value, {
    type: 'keepAlive',
  });
  return txRes;
};

export const getBitcoinNativeTransaction = async (
  network: BitcoinNetwork,
  tx: GenericTransaction,
): Promise<BTCTxInfo> => {
  const api = (await network.api()) as BitcoinAPI;
  const utxos = await api.getUTXOs(tx.from);
  const txInfo = getBTCTxInfo(utxos);
  let balance = 0;
  utxos.forEach(u => {
    balance += u.value;
  });
  const toAmount = toBN(tx.value);
  const remainder = balance - toAmount.toNumber();
  txInfo.outputs.push({
    address: tx.to,
    value: toAmount.toNumber(),
  });
  if (remainder > 0) {
    txInfo.outputs.push({
      address: network.displayAddress(tx.from),
      value: remainder,
    });
  }
  return txInfo;
};

/**
 * Create a new internal representation of an EVM transaction
 *
 * (Doesn't do anything asynchronous, just async for lazy loading)
 */
export const getEVMTransaction = async (
  network: EvmNetwork,
  tx: EVMTransaction,
  nonce?: `0x${string}`,
): Promise<Transaction> => {
  const api = await network.api();
  const txRes = new Transaction(
    {
      to: tx.to as `0x${string}`,
      from: tx.from as `0x${string}`,
      data: tx.data as `0x${string}`,
      chainId: (network as EvmNetwork).chainID,
      value: tx.value as `0x${string}`,
      gas: tx.gasLimit as `0x${string}`,
      nonce,
    },
    (api as EvmAPI).web3 as Web3Eth,
  );
  return txRes;
};

export const getSwapTransactions = async (
  networkName: SupportedNetworkName,
  transactions: TransactionType[],
): Promise<any[]> => {
  const netInfo = getNetworkInfoByName(networkName);
  const network = await getNetworkByName(
    networkName as unknown as NetworkNames,
  );
  if (netInfo.type === NetworkType.EVM) {
    const txPromises = (transactions as EVMTransaction[]).map(async txData => {
      const eTx = await getEVMTransaction(network as EvmNetwork, txData);
      return eTx;
    });
    const allTxs = await Promise.all(txPromises);
    return allTxs;
  } else if (netInfo.type === NetworkType.Solana) {
    const solTxs: (
      | {
          kind: 'legacy';
          instance: SolanaLegacyTransaction;
          hasThirdPartySignatures: boolean;
        }
      | {
          kind: 'versioned';
          instance: SolanaVersionedTransaction;
          hasThirdPartySignatures: boolean;
        }
    )[] = (transactions as EnkryptSolanaTransaction[]).map(function (enkSolTx) {
      switch (enkSolTx.kind) {
        case 'legacy':
          return {
            kind: 'legacy',
            hasThirdPartySignatures: enkSolTx.thirdPartySignatures.length > 0,
            instance: SolanaLegacyTransaction.from(
              Buffer.from(enkSolTx.serialized, 'base64'),
            ),
          };
        case 'versioned':
          return {
            kind: 'versioned',
            hasThirdPartySignatures: enkSolTx.thirdPartySignatures.length > 0,
            instance: SolanaVersionedTransaction.deserialize(
              Buffer.from(enkSolTx.serialized, 'base64'),
            ),
          };
        default:
          throw new Error(
            `Cannot deserialize Solana transaction: Unexpected kind: ${enkSolTx.kind}`,
          );
      }
    });
    return solTxs;
  } else if (netInfo.type === NetworkType.Substrate) {
    if (transactions.length > 1)
      throw new Error(`Subtrate chains can only have maximum one transaction`);
    const sTx = transactions[0] as GenericTransaction;
    const tx = await getSubstrateNativeTransation(
      network as SubstrateNetwork,
      sTx,
    );
    return [tx];
  } else if (netInfo.type === NetworkType.Bitcoin) {
    if (transactions.length > 1)
      throw new Error(`Bitcoin chains can only have maximum one transaction`);
    const sTx = transactions[0] as GenericTransaction;
    const tx = await getBitcoinNativeTransaction(
      network as BitcoinNetwork,
      sTx,
    );
    return [tx];
  } else {
    throw new Error('unsupported network type');
  }
};
