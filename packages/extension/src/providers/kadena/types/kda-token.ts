import { BaseToken, BaseTokenOptions, SendOptions } from "@/types/base-token";
import KadenaAPI from "@/providers/kadena/libs/api";
import { ChainId, ICommand, Pact, addSignatures } from "@kadena/client";
import { TransactionSigner } from "../ui/libs/signer";
import { EnkryptAccount } from "@enkryptcom/types";
import { KadenaNetwork } from "./kadena-network";

export abstract class KDABaseToken extends BaseToken {
  public abstract buildTransaction(
    to: string,
    from: EnkryptAccount,
    amount: string,
    network: KadenaNetwork
  ): Promise<ICommand>;
}

export class KDAToken extends KDABaseToken {
  constructor(options: BaseTokenOptions) {
    super(options);
  }

  public async getLatestUserBalance(
    api: KadenaAPI,
    pubkey: string
  ): Promise<string> {
    return api.getBalance(pubkey);
  }

  public async send(
    api: any,
    to: string,
    amount: string,
    options: SendOptions
  ): Promise<any> {
    throw new Error("EVM-send is not implemented here");
  }

  public async buildTransaction(
    to: string,
    from: EnkryptAccount | any,
    amount: string,
    network: KadenaNetwork
  ): Promise<ICommand> {
    const modules = Pact.modules as any;
    const unsignedTransaction = Pact.builder
      .execution(
        modules.coin.transfer(from.address, to, {
          decimal: amount,
        })
      )
      .addData("ks", {
        keys: [to],
        pred: "keys-all",
      })
      .addSigner(from.address, (withCap: any) => [
        withCap("coin.TRANSFER", from.address, to, {
          decimal: amount,
        }),
        withCap("coin.GAS"),
      ])
      .setMeta({
        chainId: network.options.kadenaApiOptions.chainId as ChainId,
        senderAccount: from.address,
      })
      .setNetworkId(network.options.kadenaApiOptions.networkId)
      .createTransaction();

    const transaction = await TransactionSigner({
      account: from,
      network: network,
      payload: unsignedTransaction.cmd,
    }).then((res) => {
      if (res.error) return Promise.reject(res.error);
      else
        return {
          id: 0,
          signature: res.result as string,
        };
    });

    return addSignatures(unsignedTransaction, {
      sig: transaction.signature,
      pubKey: from.address,
    }) as ICommand;
  }
}
