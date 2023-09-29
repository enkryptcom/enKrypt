import {
  EthereumRawInfo,
  SubscanExtrinsicInfo,
  BTCRawInfo,
} from "@/types/activity";
import { ProviderAPIInterface } from "@/types/provider";
import { KadenaNetworkOptions } from "../types/kadena-network";
import {
  ICommand,
  ICommandResult,
  ITransactionDescriptor,
  createClient,
  Pact,
  ChainId,
} from "@kadena/client";
import { toBase } from "@enkryptcom/utils";

class API implements ProviderAPIInterface {
  decimals: number;
  node: string;
  networkId: string;
  chainId: string;
  apiHost: string;
  keyPair = {
    publicKey: "",
    secretKey: "",
  };

  constructor(node: string, options: KadenaNetworkOptions) {
    this.decimals = options.decimals;

    this.node = node;
    this.networkId = options.kadenaApiOptions.networkId;
    this.chainId = options.kadenaApiOptions.chainId;
    this.apiHost = `${node}/${this.networkId}/chain/${this.chainId}/pact`;
  }

  public get api() {
    return this;
  }

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  async init(): Promise<void> {}

  getTransactionStatus(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    hash: string
  ): Promise<EthereumRawInfo | SubscanExtrinsicInfo | BTCRawInfo | null> {
    throw new Error("Method not implemented.");
  }

  async getBalance(address: string): Promise<string> {
    const balance = await this.getBalanceAPI(address);

    if (balance.result.status === "failure") {
      return toBase("0", this.decimals);
    }

    const balanceValue = balance.result.data.toString();

    return toBase(balanceValue, this.decimals);
  }

  async getBalanceAPI(account: string) {
    const modules = Pact.modules as any;
    const transaction = Pact.builder
      .execution(modules.coin["get-balance"](account))
      .setMeta({ chainId: this.chainId as ChainId })
      .createTransaction();

    const client = createClient(this.apiHost);
    return client.local(transaction, {
      preflight: false,
      signatureVerification: false,
    });
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
