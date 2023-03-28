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

type TransactionType = EVMTransaction | GenericTransaction;

export const getSwapTransactions = async (
  networkName: SupportedNetworkName,
  transactions: TransactionType[]
) => {
  const netInfo = getNetworkInfoByName(networkName);
  const network = await getNetworkByName(
    networkName as unknown as NetworkNames
  );
  if ((netInfo.type = NetworkType.EVM)) {
    const api = await (network as EvmNetwork).api();
    return (transactions as EVMTransaction[]).map((txData) => {
      const tx = new Transaction(
        {
          to: txData.to as `0x${string}`,
          from: txData.from as `0x${string}`,
          data: txData.data as `0x${string}`,
          chainId: (network as EvmNetwork).chainID,
          value: txData.value as `0x${string}`,
          gas: txData.gasLimit as `0x${string}`,
        },
        (api as EvmAPI).web3 as Web3Eth
      );
      return tx;
    });
  } else if (netInfo.type === NetworkType.Substrate) {
    const api = await network!.api();
    if (transactions.length > 1)
      throw new Error(`Subtrate chains can only have maximum one transaction`);
    const sTx = transactions[0] as GenericTransaction;
    const fromToken = new SubstrateNativeToken({
      decimals: network!.decimals,
      icon: network!.icon,
      name: network!.name,
      symbol: network!.currencyName,
      existentialDeposit: (network as SubstrateNetwork).existentialDeposit,
      coingeckoID: network!.coingeckoID,
    });
    const tx = await fromToken.send(api.api as ApiPromise, sTx.to, sTx.value, {
      type: "keepAlive",
    });
    return [tx];
  }
};
