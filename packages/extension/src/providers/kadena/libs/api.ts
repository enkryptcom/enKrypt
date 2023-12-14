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
import DomainState from "@/libs/domain-state";

class API implements ProviderAPIInterface {
  decimals: number;
  node: string;
  networkId: string;
  chainId: string;
  apiHost: string;
  domainState: DomainState;
  displayAddress: (address: string) => string;

  constructor(node: string, options: KadenaNetworkOptions) {
    this.decimals = options.decimals;
    this.node = node;
    this.networkId = options.kadenaApiOptions.networkId;
    this.chainId = options.kadenaApiOptions.chainId;
    this.apiHost = `${node}/${this.networkId}/chain/${this.chainId}/pact`;
    this.displayAddress = options.displayAddress;
    this.domainState = new DomainState();
  }

  public get api() {
    return this;
  }

  private getApiHost(chainId: string) {
    return `${this.node}/${this.networkId}/chain/${chainId}/pact`;
  }

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  async init(): Promise<void> {}

  async getChainId(): Promise<string> {
    return this.domainState.getSelectedSubNetWork().then((id) => {
      if (id) return id;
      return "0";
    });
  }

  async getTransactionStatus(hash: string): Promise<KadenaRawInfo | null> {
    const Pact = require("pact-lang-api");
    const cmd = { requestKeys: [hash] };
    const chainId = await this.getChainId();
    const transactions = await Pact.fetch.poll(cmd, this.getApiHost(chainId));
    return transactions[hash];
  }

  async getBalanceByChainId(address: string, chainId: string): Promise<string> {
    const balance = await this.getBalanceAPI(
      this.displayAddress(address),
      chainId
    );

    if (balance.result.error) {
      return toBase("0", this.decimals);
    }

    const balanceValue = parseFloat(balance.result.data.toString()).toFixed(
      this.decimals
    );

    return toBase(balanceValue, this.decimals);
  }

  async getBalance(address: string): Promise<string> {
    const chainId = await this.getChainId();
    return this.getBalanceByChainId(address, chainId);
  }

  async getBalanceAPI(account: string, chainId: string) {
    const Pact = require("pact-lang-api");
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

    return Pact.fetch.local(cmd, this.getApiHost(chainId));
  }

  async sendLocalTransaction(
    signedTranscation: ICommand
  ): Promise<ICommandResult> {
    const chainId = await this.getChainId();
    const client = createClient(this.getApiHost(chainId));
    return client.local(signedTranscation as ICommand);
  }

  async sendTransaction(
    signedTranscation: ICommand
  ): Promise<ITransactionDescriptor> {
    const chainId = await this.getChainId();
    const client = createClient(this.getApiHost(chainId));
    return client.submit(signedTranscation as ICommand);
  }

  async listen(
    transactionDescriptor: ITransactionDescriptor
  ): Promise<ICommandResult> {
    const chainId = await this.getChainId();
    const client = createClient(this.getApiHost(chainId));
    return client.listen(transactionDescriptor);
  }

  async dirtyRead(signedTranscation: ICommand): Promise<ICommandResult> {
    const chainId = await this.getChainId();
    const client = createClient(this.getApiHost(chainId));
    return client.dirtyRead(signedTranscation);
  }
}

export default API;
