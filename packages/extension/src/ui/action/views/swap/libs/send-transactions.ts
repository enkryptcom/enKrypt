import { EvmNetwork } from "@/providers/ethereum/types/evm-network";
import { Activity, ActivityStatus, ActivityType } from "@/types/activity";
import {
  EVMTransaction,
  GenericTransaction,
  NetworkType,
} from "@enkryptcom/swap";
import { ApiPromise } from "@polkadot/api";
import { TypeRegistry } from "@polkadot/types";
import { SignerResult } from "@polkadot/types/types";
import { ExecuteSwapOptions } from "../types";
import { TransactionSigner as SubstrateTransactionSigner } from "@/providers/polkadot/ui/libs/signer";
import { TransactionSigner as EvmTransactionSigner } from "@/providers/ethereum/ui/libs/signer";
import ActivityState from "@/libs/activity-state";
import { u8aToHex } from "@polkadot/util";
import EvmAPI from "@/providers/ethereum/libs/api";
import { getEVMTransaction, getSubstrateNativeTransation } from "./swap-txs";
import { SubstrateNetwork } from "@/providers/polkadot/types/substrate-network";
import { toBN } from "web3-utils";
import type Transaction from "@/providers/ethereum/libs/transaction";
import { bigIntToHex } from "@enkryptcom/utils";
import broadcastTx from "@/providers/ethereum/libs/tx-broadcaster";

export const executeSwap = async (
  options: ExecuteSwapOptions
): Promise<`0x${string}`[]> => {
  const activityState = new ActivityState();
  const api = await (options.network as EvmNetwork).api();
  if (options.networkType === NetworkType.Substrate) {
    const substrateTx = await getSubstrateNativeTransation(
      options.network as SubstrateNetwork,
      options.swap.transactions[0] as GenericTransaction
    );
    const txActivity: Activity = {
      from: options.network.displayAddress(options.from.address),
      to: options.swap.transactions[0].to,
      token: {
        decimals: options.fromToken.decimals,
        icon: options.fromToken.logoURI,
        name: options.fromToken.name,
        symbol: options.fromToken.symbol,
        coingeckoID: options.fromToken.cgId,
      },
      isIncoming: false,
      network: options.network.name,
      status: ActivityStatus.pending,
      timestamp: new Date().getTime(),
      type: ActivityType.transaction,
      value: options.swap.fromTokenAmount.toString(),
      transactionHash: "",
    };
    const tx = (api.api as ApiPromise).tx(substrateTx.toHex());
    try {
      const signedTx = await tx.signAsync(options.from.address, {
        signer: {
          signPayload: (signPayload): Promise<SignerResult> => {
            const registry = new TypeRegistry();
            registry.setSignedExtensions(signPayload.signedExtensions);
            const extType = registry.createType(
              "ExtrinsicPayload",
              signPayload,
              {
                version: signPayload.version,
              }
            );
            return SubstrateTransactionSigner({
              account: options.from,
              network: options.network,
              payload: extType,
            }).then((res) => {
              if (res.error) return Promise.reject(res.error);
              else
                return {
                  id: 0,
                  signature: JSON.parse(res.result as string),
                };
            });
          },
        },
      });

      const hash = await signedTx.send();
      await activityState.addActivities(
        [
          {
            ...JSON.parse(JSON.stringify(txActivity)),
            ...{ transactionHash: hash },
          },
        ],
        { address: options.from.address, network: options.network.name }
      );
      return [u8aToHex(hash)];
    } catch (error) {
      console.error("error", error);
      return ["0x"];
    }
  } else if (options.networkType === NetworkType.EVM) {
    const web3 = (api as EvmAPI).web3;
    const nonce = await web3.getTransactionCount(options.from.address);
    const txsPromises = (options.swap.transactions as EVMTransaction[]).map(
      async (tx, index) => {
        const txActivity: Activity = {
          from: tx.from,
          to: tx.to,
          token: {
            decimals: options.fromToken.decimals,
            icon: options.fromToken.logoURI,
            name: options.fromToken.name,
            symbol: options.fromToken.symbol,
            coingeckoID: options.fromToken.cgId,
            price: options.fromToken.price
              ? options.fromToken.price.toString()
              : "0",
          },
          isIncoming: false,
          network: options.network.name,
          status: ActivityStatus.pending,
          timestamp: new Date().getTime(),
          type: ActivityType.transaction,
          value:
            index === options.swap.transactions.length - 1
              ? options.swap.fromTokenAmount.toString()
              : "0",
          transactionHash: "",
        };
        const evmTx: Transaction = await getEVMTransaction(
          options.network as EvmNetwork,
          tx,
          `0x${toBN(nonce).addn(index).toString("hex")}` as `0x${string}`
        );
        return [evmTx, txActivity] as const;
      }
    );
    const txs = await Promise.all(txsPromises);
    const txPromises: `0x${string}`[] = [];
    for (const txInfo of txs) {
      const [tx, activity] = txInfo;
      const hash = await tx
        .getFinalizedTransaction({
          gasPriceType: options.gasPriceType,
        })
        .then((finalizedTx) =>
          EvmTransactionSigner({
            account: options.from,
            network: options.network,
            payload: finalizedTx,
          }).then((signedTx) => {
            return new Promise(
              (
                resolve: (h: `0x${string}`) => void,
                reject: (err: any) => void
              ) => {
                const onHash = (hash: string) => {
                  if (activity) {
                    activityState
                      .addActivities(
                        [
                          {
                            ...JSON.parse(JSON.stringify(activity)),
                            ...{
                              transactionHash: hash,
                              nonce: bigIntToHex(finalizedTx.nonce),
                            },
                          },
                        ],
                        {
                          address: options.from.address,
                          network: options.network.name,
                        }
                      )
                      .then(() => resolve(hash as `0x${string}`));
                  }
                };
                broadcastTx(
                  `0x${signedTx.serialize().toString("hex")}`,
                  options.network.name
                )
                  .then(onHash)
                  .catch(() => {
                    web3
                      .sendSignedTransaction(
                        `0x${signedTx.serialize().toString("hex")}`
                      )
                      .on("transactionHash", onHash)
                      .catch(reject);
                  });
              }
            );
          })
        );
      txPromises.push(hash);
    }
    return txPromises;
  } else {
    throw new Error("Network type not supported");
  }
};
