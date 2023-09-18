import { BaseToken, BaseTokenOptions, SendOptions } from "@/types/base-token";
import KadenaAPI from "@/providers/kadena/libs/api";
import {
  ICommand,
  ICommandResult,
  IUnsignedCommand,
  Pact,
  addSignatures,
  createClient,
} from "@kadena/client";
import { TransactionSigner } from "../ui/libs/signer";
import { BaseNetwork } from "@/types/base-network";
import { EnkryptAccount } from "@enkryptcom/types";

export abstract class KDABaseToken extends BaseToken {
  public abstract sendLocal(
    to: string,
    from: EnkryptAccount,
    amount: string,
    network: BaseNetwork
  ): Promise<ICommandResult>;
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

  public async sendLocal(
    to: string,
    from: EnkryptAccount | any,
    amount: string,
    network: BaseNetwork
  ): Promise<ICommandResult> {
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
      .setMeta({ chainId: "1", senderAccount: from.address })
      .setNetworkId("testnet04")
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

    const signedTranscation: IUnsignedCommand | ICommand = addSignatures(
      unsignedTransaction,
      {
        sig: transaction.signature,
        pubKey: from.address,
      }
    );

    const client = createClient(
      "https://api.testnet.chainweb.com/chainweb/0.0/testnet04/chain/1/pact"
    );
    return client.local(signedTranscation as ICommand);
  }
}
