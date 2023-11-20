import { KadenaRawInfo } from "@/types/activity";
import { ProviderAPIInterface } from "@/types/provider";
import { KadenaNetworkOptions } from "../types/kadena-network";
import {
  ICommand,
  ICommandResult,
  ITransactionDescriptor,
  createClient,
} from "@kadena/client";
import { toBase } from "@enkryptcom/utils";

class API implements ProviderAPIInterface {
  decimals: number;
  node: string;
  networkId: string;
  chainId: string;
  apiHost: string;
  displayAddress: (address: string) => string;

  constructor(node: string, options: KadenaNetworkOptions) {
    this.decimals = options.decimals;
    this.node = node;
    this.networkId = options.kadenaApiOptions.networkId;
    this.chainId = options.kadenaApiOptions.chainId;
    this.apiHost = `${node}/${this.networkId}/chain/${this.chainId}/pact`;
    this.displayAddress = options.displayAddress;
  }

  public get api() {
    return this;
  }

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  async init(): Promise<void> {}

  async getTransactionStatus(hash: string): Promise<KadenaRawInfo | null> {
    return this.getTransactionStatusChainId(hash, this.chainId);
  }

  async getTransactionStatusChainId(
    hash: string,
    chainId: string
  ): Promise<KadenaRawInfo | null> {
    const Pact = require("pact-lang-api");
    const urlApiHost = `${this.node}/${this.networkId}/chain/${chainId}/pact`;

    const cmd = { requestKeys: [hash] };
    const transactions = await Pact.fetch.poll(cmd, urlApiHost);

    return transactions[hash];
  }

  async getBalance(address: string, chainId?: string): Promise<string> {
    const balance = await this.getBalanceAPI(
      this.displayAddress(address),
      chainId ?? this.chainId
    );

    if (balance.result.error) {
      return toBase("0", this.decimals);
    }

    const balanceValue = parseFloat(balance.result.data.toString()).toFixed(
      this.decimals
    );

    return toBase(balanceValue, this.decimals);
  }

  async getBalanceAPI(account: string, chainId: string) {
    const Pact = require("pact-lang-api");
    const urlApiHost = `${this.node}/${this.networkId}/chain/${chainId}/pact`;
    const cmd = {
      networkId: this.networkId,
      pactCode: `(coin.get-balance "${account}")`,
      envData: {},
      meta: {
        creationTime: Math.round(new Date().getTime() / 1000),
        ttl: 600,
        gasLimit: 600,
        chainId: chainId,
        gasPrice: 0.0000001,
        sender: "",
      },
    };

    return Pact.fetch.local(cmd, urlApiHost);
  }

  async sendLocalTransaction(
    signedTranscation: ICommand
  ): Promise<ICommandResult> {
    const client = createClient(this.apiHost);
    return client.local(signedTranscation as ICommand);
  }

  async sendTransaction(
    signedTranscation: ICommand
  ): Promise<ITransactionDescriptor> {
    const client = createClient(this.apiHost);
    return client.submit(signedTranscation as ICommand);
  }

  async listen(
    transactionDescriptor: ITransactionDescriptor
  ): Promise<ICommandResult> {
    const client = createClient(this.apiHost);
    return client.listen(transactionDescriptor);
  }

  async dirtyRead(signedTranscation: ICommand): Promise<ICommandResult> {
    const client = createClient(this.apiHost);
    return client.dirtyRead(signedTranscation);
  }
}

export default API;
