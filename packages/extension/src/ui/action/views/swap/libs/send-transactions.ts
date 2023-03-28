import { GasPriceTypes } from "@/providers/common/types";
import { EvmNetwork } from "@/providers/ethereum/types/evm-network";
import { BaseNetwork } from "@/types/base-network";
import { NetworkType } from "@enkryptcom/swap";
import { EnkryptAccount } from "@enkryptcom/types";
import { ApiPromise } from "@polkadot/api";

const executeTrade = async (
  network: BaseNetwork,
  fromAccount: EnkryptAccount,
  transactions: any[],
  type: NetworkType,
  gasPriceType?: GasPriceTypes
): Promise<`0x${string}`[]> => {
  const api = await (network as EvmNetwork).api();
  if (type === NetworkType.Substrate) {
    const apiPromise = api.api as ApiPromise;

    const { to, from, token, data, tokenValue } = trade.txs[0];

    const tx = apiPromise.tx(data);

    const txActivity: Activity = {
      from: network.displayAddress(from),
      to,
      token,
      isIncoming: fromAccount.address === trade.txs[0].to,
      network: network.name,
      status: ActivityStatus.pending,
      timestamp: new Date().getTime(),
      type: ActivityType.transaction,
      value: toBase(tokenValue, token.decimals),
      swapId: trade.rateId,
      transactionHash: "",
    };

    try {
      const signedTx = await tx.signAsync(fromAccount.address, {
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
              account: fromAccount,
              network: network,
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
        { address: fromAccount.address, network: network.name }
      );
      return [u8aToHex(hash)];
    } catch (error) {
      console.error("error", error);
      return ["0x"];
    }
  } else {
    const web3 = (api as EvmAPI).web3;
    web3.handleRevert = true;

    const { data, value, to, from, tokenValue, token } = trade.txs[0];

    const tx = new Transaction(
      {
        from: fromAccount.address as `0x${string}`,
        to: to as `0x${string}`,
        data,
        value,
        chainId: (network as EvmNetwork).chainID,
      },
      web3
    );

    const txActivity: Activity = {
      from,
      to,
      token,
      isIncoming: fromAccount.address === to,
      network: network.name,
      status: ActivityStatus.pending,
      timestamp: new Date().getTime(),
      type: ActivityType.transaction,
      value: toBase(tokenValue, token.decimals),
      swapId: trade.rateId,
      transactionHash: "",
    };

    return tx
      .getFinalizedTransaction({
        gasPriceType: gasPriceType ?? GasPriceTypes.REGULAR,
      })
      .then((finalizedTx) =>
        EvmTransactionSigner({
          account: fromAccount,
          network: network,
          payload: finalizedTx,
        }).then((signedTx) => {
          return new Promise((resolve) => {
            const onHash = (hash: string) => {
              activityState.addActivities(
                [
                  {
                    ...JSON.parse(JSON.stringify(txActivity)),
                    ...{
                      transactionHash: hash,
                      nonce: bigIntToHex(finalizedTx.nonce),
                    },
                  },
                ],
                { address: fromAccount.address, network: network.name }
              );
              resolve([hash] as `0x${string}`[]);
            };
            broadcastTx(
              `0x${signedTx.serialize().toString("hex")}`,
              network.name
            )
              .then(onHash)
              .catch(() => {
                web3
                  .sendSignedTransaction(
                    `0x${signedTx.serialize().toString("hex")}`
                  )
                  .on("transactionHash", onHash);
              });
          });
        })
      );
  }
};
