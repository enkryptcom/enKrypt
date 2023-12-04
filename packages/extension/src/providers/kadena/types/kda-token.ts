import { BaseToken, BaseTokenOptions } from "@/types/base-token";
import KadenaAPI from "@/providers/kadena/libs/api";
import { ChainId, ICommand, Pact, addSignatures } from "@kadena/client";
import { EnkryptAccount } from "@enkryptcom/types";
import { blake2AsU8a } from "@polkadot/util-crypto";
import { KadenaNetwork } from "./kadena-network";
import { TransactionSigner } from "../ui/libs/signer";
import { bufferToHex } from "@enkryptcom/utils";

export abstract class KDABaseToken extends BaseToken {
  public abstract buildTransaction(
    to: string,
    from: EnkryptAccount,
    amount: string,
    network: KadenaNetwork
  ): Promise<ICommand>;

  public abstract getAccountDetails(
    account: string,
    network: KadenaNetwork
  ): Promise<any>;

  public abstract getBalance(
    api: KadenaAPI,
    pubkey: string,
    chainId?: string
  ): Promise<string>;
}

export class KDAToken extends KDABaseToken {
  constructor(options: BaseTokenOptions) {
    super(options);
  }

  public async getLatestUserBalance(
    api: KadenaAPI,
    pubkey: string
  ): Promise<string> {
    throw new Error("KDA-getLatestUserBalance is not implemented here");
  }

  public async getBalance(
    api: KadenaAPI,
    pubkey: string,
    chainId?: string
  ): Promise<string> {
    return api.getBalance(pubkey, chainId);
  }

  public async send(): Promise<any> {
    throw new Error("KDA-send is not implemented here");
  }

  public async buildTransaction(
    to: string,
    from: EnkryptAccount | any,
    amount: string,
    network: KadenaNetwork,
    chainId?: string
  ): Promise<ICommand> {
    to = network.displayAddress(to);
    const accountDetails = await this.getAccountDetails(to, network, chainId);
    const keySetAccount = to.startsWith("k:") ? to.replace("k:", "") : to;
    const unsignedTransaction = Pact.builder
      .execution(
        `(coin.transfer-create "${network.displayAddress(
          from.address
        )}" "${to}" (read-keyset "ks") ${parseFloat(amount).toFixed(
          network.options.decimals
        )})`
      )
      .addData("ks", {
        keys: accountDetails.data?.guard.keys || [keySetAccount],
        pred: accountDetails.data?.guard.pred || "keys-all",
      })
      .addSigner(from.publicKey.replace("0x", ""), (withCap: any) => [
        withCap("coin.TRANSFER", network.displayAddress(from.address), to, {
          decimal: amount,
        }),
        withCap("coin.GAS"),
      ])
      .setMeta({
        chainId: (chainId ??
          network.options.kadenaApiOptions.chainId) as ChainId,
        senderAccount: network.displayAddress(from.address),
      })
      .setNetworkId(network.options.kadenaApiOptions.networkId)
      .createTransaction();

    if (from.isHardware) {
      const transaction = await TransactionSigner({
        account: from,
        network: network,
        payload: unsignedTransaction.cmd,
      }).then((res) => {
        if (res.error) return Promise.reject(res.error);
        return JSON.parse(res.result as string);
      });
      return transaction as ICommand;
    }
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
      pubKey: from.pubKey,
    }) as ICommand;
  }

  public async getAccountDetails(
    account: string,
    network: KadenaNetwork,
    chainId?: string
  ): Promise<any> {
    const modules = Pact.modules as any;
    const unsignedTransaction = Pact.builder
      .execution(modules.coin.details(account))
      .setMeta({
        chainId: (chainId ??
          network.options.kadenaApiOptions.chainId) as ChainId,
      })
      .setNetworkId(network.options.kadenaApiOptions.networkId)
      .createTransaction();

    const api = (await network.api()) as KadenaAPI;
    const response = await api.dirtyRead(
      unsignedTransaction as ICommand,
      chainId!
    );

    return response.result;
  }
}
