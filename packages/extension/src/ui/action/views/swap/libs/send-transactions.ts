import { EvmNetwork } from "@/providers/ethereum/types/evm-network";
import { Activity, ActivityStatus, ActivityType } from "@/types/activity";
import {
  EVMTransaction,
  GenericTransaction,
  SolanaTransaction as EnkryptSolanaTransaction,
  NetworkType,
} from "@enkryptcom/swap";
import { ApiPromise } from "@polkadot/api";
import { TypeRegistry } from "@polkadot/types";
import { SignerResult } from "@polkadot/types/types";
import { ExecuteSwapOptions } from "../types";
import { TransactionSigner as SubstrateTransactionSigner } from "@/providers/polkadot/ui/libs/signer";
import { TransactionSigner as EvmTransactionSigner } from "@/providers/ethereum/ui/libs/signer";
import { TransactionSigner as BitcoinTransactionSigner } from "@/providers/bitcoin/ui/libs/signer";
import ActivityState from "@/libs/activity-state";
import { u8aToHex } from "@polkadot/util";
import EvmAPI from "@/providers/ethereum/libs/api";
import {
  getBitcoinNativeTransaction,
  getEVMTransaction,
  getSubstrateNativeTransation,
} from "./swap-txs";
import { SubstrateNetwork } from "@/providers/polkadot/types/substrate-network";
import { toBN } from "web3-utils";
import type Transaction from "@/providers/ethereum/libs/transaction";
import {
  bigIntToHex,
  bufferToHex,
  hexToBuffer,
  toBase,
} from "@enkryptcom/utils";
import broadcastTx from "@/providers/ethereum/libs/tx-broadcaster";
import { BitcoinNetwork } from "@/providers/bitcoin/types/bitcoin-network";
import { getBitcoinGasVals } from "./bitcoin-gasvals";
import BitcoinAPI from "@/providers/bitcoin/libs/api";
import SolanaAPI from "@/providers/solana/libs/api";
import {
  VersionedTransaction as SolanaVersionedTransaction,
  PublicKey,
  SendTransactionError,
} from "@solana/web3.js";
import sendUsingInternalMessengers from "@/libs/messenger/internal-messenger";
import { InternalMethods } from "@/types/messenger";
import bs58 from "bs58";

/**
 * Create an Activity model that can be displayed in the UI to represent
 * a transaction. By default returns a pending transaction.
 */
const getBaseActivity = (options: ExecuteSwapOptions): Activity => {
  const txActivity: Activity = {
    from: options.network.displayAddress(options.from.address),
    to: options.swap.transactions[0].to,
    token: {
      decimals: options.fromToken.decimals,
      icon: options.fromToken.logoURI,
      name: options.fromToken.name,
      symbol: options.fromToken.symbol,
      coingeckoID: options.fromToken.cgId,
      price: options.fromToken.price ? options.fromToken.price.toString() : "0",
    },
    isIncoming: false,
    network: options.network.name,
    status: ActivityStatus.pending,
    timestamp: new Date().getTime(),
    type: ActivityType.transaction,
    value: options.swap.fromTokenAmount.toString(),
    transactionHash: "",
  };
  return txActivity;
};

/**
 * Execute transactions to perform a swap on a specified network
 *
 * Prepares, signs and submits transactions
 *
 * Updates UI activity state
 *
 * Returns the hashes of transactions executed as part of the swap
 */
export const executeSwap = async (
  options: ExecuteSwapOptions
): Promise<string[]> => {
  const activityState = new ActivityState();
  const api = await options.network.api();
  if (options.networkType === NetworkType.Bitcoin) {
    const bitcoinTx = await getBitcoinNativeTransaction(
      options.network as BitcoinNetwork,
      options.swap.transactions[0] as GenericTransaction
    );
    const gasVals = await getBitcoinGasVals([bitcoinTx], options.network, 0);
    const selectedVal = gasVals[options.gasPriceType].nativeValue;
    const nativeFeeAmount = toBN(
      toBase(selectedVal, options.network.decimals)
    ).toNumber();
    bitcoinTx.outputs[0].value = bitcoinTx.outputs[0].value - nativeFeeAmount;
    const txActivity = getBaseActivity(options);
    const signedTx = await BitcoinTransactionSigner({
      account: options.from,
      network: options.network as BitcoinNetwork,
      payload: bitcoinTx,
    });
    const bitcoinApi = api as BitcoinAPI;
    bitcoinApi
      .broadcastTx(signedTx.extractTransaction().toHex())
      .then(() => {
        activityState.addActivities(
          [
            {
              ...JSON.parse(JSON.stringify(txActivity)),
              ...{ transactionHash: signedTx.extractTransaction().getId() },
            },
          ],
          { address: txActivity.from, network: options.network.name }
        );
      })
      .catch(() => {
        txActivity.status = ActivityStatus.failed;
        activityState.addActivities([txActivity], {
          address: txActivity.from,
          network: options.network.name,
        });
      });
    return [signedTx.extractTransaction().getId() as `0x${string}`];
  } else if (options.networkType === NetworkType.Substrate) {
    const substrateTx = await getSubstrateNativeTransation(
      options.network as SubstrateNetwork,
      options.swap.transactions[0] as GenericTransaction
    );
    const txActivity = getBaseActivity(options);
    const tx = (api.api as ApiPromise).tx(substrateTx.toHex());
    const signedTx = await tx.signAsync(options.from.address, {
      signer: {
        signPayload: (signPayload): Promise<SignerResult> => {
          const registry = new TypeRegistry();
          registry.setSignedExtensions(signPayload.signedExtensions);
          const extType = registry.createType("ExtrinsicPayload", signPayload, {
            version: signPayload.version,
          });
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
    const hash = u8aToHex(signedTx.hash);
    await signedTx
      .send()
      .then(async () => {
        await activityState.addActivities(
          [
            {
              ...JSON.parse(JSON.stringify(txActivity)),
              transactionHash: hash,
            },
          ],
          { address: txActivity.from, network: options.network.name }
        );
      })
      .catch(async () => {
        await activityState.addActivities(
          [
            {
              ...JSON.parse(JSON.stringify(txActivity)),
              transactionHash: hash,
              status: ActivityStatus.failed,
            },
          ],
          { address: txActivity.from, network: options.network.name }
        );
      });
    return [hash];
  } else if (options.networkType === NetworkType.Solana) {
    // Execute the swap on Solana
    const conn = (api as SolanaAPI).api.web3;

    const solTxHashes: string[] = [];

    /** Enkrypt representation of the swap transactions */
    const enkSolTxs = options.swap.transactions as EnkryptSolanaTransaction[];

    // Execute each transaction in-order one-by-one
    for (const enkSolTx of enkSolTxs) {
      // Transform the Enkrypt representation of the transaction into the Solana lib's representation
      const tx = SolanaVersionedTransaction.deserialize(
        Buffer.from(enkSolTx.serialized, "base64")
      );

      // Sign the transaction message
      // Use the keyring running in the background script
      const sigRes = await sendUsingInternalMessengers({
        method: InternalMethods.sign,
        params: [bufferToHex(tx.message.serialize()), options.from],
      });

      // Did we fail to sign?
      if (sigRes.error != null) {
        throw new Error(
          `Failed to sign Solana swap transaction: ${sigRes.error.code} ${sigRes.error.message}`
        );
      }

      // Add signature to the transaction
      // (For some reason the address is hex encoded instead of base58
      // encoded so we need to transform it)
      tx.addSignature(
        new PublicKey(
          bs58.encode(Buffer.from(options.from.address.slice(2), "hex"))
        ),
        hexToBuffer(JSON.parse(sigRes.result!))
      );

      // Send the transaction
      let txHash: string;
      try {
        txHash = await conn.sendRawTransaction(tx.serialize());
      } catch (err) {
        // Log error info if possible
        // The Solana web3 library prompts you to call getLogs if your error is of type
        // SendTransactionError to get more info about the error
        if (err instanceof SendTransactionError) {
          try {
            const logs = await err.getLogs(conn);
            console.error(
              "Failed to send Solana swap transaction. Logs:",
              logs
            );
          } catch (err) {
            console.error(
              "Failed to send Solana swap transaction and failed to decode logs",
              err
            );
          }
        } else {
          console.error(
            `Failed to send Solana swap transaction, unhandled error ${
              (err as Error).name
            }`
          );
        }
        throw err;
      }

      // Update transaction activity for the UI
      const activity = getBaseActivity(options);
      activity.transactionHash = txHash;
      await activityState.addActivities([activity], {
        address: activity.from,
        network: options.network.name,
      });

      // TODO:get the status of the transaction?
      // activity.status = // success | failed | pending

      solTxHashes.push(txHash);
    }

    // Finished executing the swap on Solana

    return solTxHashes;
  } else if (options.networkType === NetworkType.EVM) {
    const web3 = (api as EvmAPI).web3;
    const nonce = await web3.getTransactionCount(options.from.address);
    // Load transactions so they can be built & sent and activity so it can be shown in the API
    const txsPromises = (options.swap.transactions as EVMTransaction[]).map(
      async (tx, index) => {
        // (note: doesn't do anything async, just async for lazy loading)
        const txActivity = getBaseActivity(options);
        txActivity.value =
          index === options.swap.transactions.length - 1
            ? options.swap.fromTokenAmount.toString()
            : "0";
        txActivity.to = tx.to;
        const evmTx: Transaction = await getEVMTransaction(
          options.network as EvmNetwork,
          tx,
          `0x${toBN(nonce).addn(index).toString("hex")}` as `0x${string}`
        );
        return [evmTx, txActivity] as const;
      }
    );
    const txs = await Promise.all(txsPromises);
    /** Hashes of transactions successfully sent & mined, in order of execution */
    const txPromises: `0x${string}`[] = [];

    for (const txInfo of txs) {
      // Submit each transaction, in-order one-by-one
      const [tx, activity] = txInfo;
      const hash = await tx
        // Prepare the transaction
        .getFinalizedTransaction({
          gasPriceType: options.gasPriceType,
        })
        .then((finalizedTx) =>
          // Sign the transaction
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
                    // Show in the UI
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
                          address: activity.from,
                          network: options.network.name,
                        }
                      )
                      .then(() => resolve(hash as `0x${string}`));
                  }
                };
                // Broadcast the unsigned transaction via MEW endpoint so it can instantly be viewed in the
                // EthVM Block Explorer, if this fails we fallback to regular endpoint
                broadcastTx(
                  bufferToHex(signedTx.serialize()),
                  options.network.name
                )
                  .then(onHash)
                  .catch(() => {
                    // Fallback to node
                    web3
                      .sendSignedTransaction(bufferToHex(signedTx.serialize()))
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
