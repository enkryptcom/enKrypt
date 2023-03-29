import type Web3Eth from "web3-eth";
import EvmAPI from "@/providers/ethereum/libs/api";
import { getNetworkByName } from "@/libs/utils/networks";
import {
  EVMTransaction,
  GenericTransaction,
  getNetworkInfoByName,
  NetworkType,
  SupportedNetworkName,
} from "@enkryptcom/swap";
import { NetworkNames } from "@enkryptcom/types";
import Transaction from "@/providers/ethereum/libs/transaction";
import { EvmNetwork } from "@/providers/ethereum/types/evm-network";
import { SubstrateNativeToken } from "@/providers/polkadot/types/substrate-native-token";
import { SubstrateNetwork } from "@/providers/polkadot/types/substrate-network";
import { ApiPromise } from "@polkadot/api";
import { TransactionType } from "../types";

export const getSubstrateNativeTransation = async (
  network: SubstrateNetwork,
  tx: GenericTransaction
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
    type: "keepAlive",
  });
  return txRes;
};

export const getEVMTransaction = async (
  network: EvmNetwork,
  tx: EVMTransaction,
  nonce?: `0x${string}`
) => {
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
    (api as EvmAPI).web3 as Web3Eth
  );
  return txRes;
};

export const getSwapTransactions = async (
  networkName: SupportedNetworkName,
  transactions: TransactionType[]
) => {
  const netInfo = getNetworkInfoByName(networkName);
  const network = await getNetworkByName(
    networkName as unknown as NetworkNames
  );
  if ((netInfo.type = NetworkType.EVM)) {
    const txPromises = (transactions as EVMTransaction[]).map(
      async (txData) => {
        const eTx = await getEVMTransaction(network as EvmNetwork, txData);
        return eTx;
      }
    );
    const allTxs = await Promise.all(txPromises);
    return allTxs;
  } else if (netInfo.type === NetworkType.Substrate) {
    if (transactions.length > 1)
      throw new Error(`Subtrate chains can only have maximum one transaction`);
    const sTx = transactions[0] as GenericTransaction;
    const tx = await getSubstrateNativeTransation(
      network as SubstrateNetwork,
      sTx
    );
    return [tx];
  }
};
