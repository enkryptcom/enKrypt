import { KadenaRawInfo } from '@/types/activity';
import { ProviderAPIInterface } from '@/types/provider';
import { KadenaNetworkOptions } from '../types/kadena-network';
import {
  ICommand,
  IUnsignedCommand,
  ICommandResult,
  ITransactionDescriptor,
  createClient,
  Pact,
  ChainId,
} from '@kadena/client';
import { toBase } from '@enkryptcom/utils';
import DomainState from '@/libs/domain-state';

/** Kadena API wrapper */
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

  async init(): Promise<void> {}

  async getChainId(): Promise<string> {
    return this.domainState.getSelectedSubNetWork().then(id => {
      if (id) return id;
      return '0';
    });
  }

  async getTransactionStatus(requestKey: string): Promise<KadenaRawInfo> {
    const chainId = await this.getChainId();
    const networkId = this.networkId;
    const { pollStatus } = createClient(this.getApiHost(chainId));
    const responses = await pollStatus({
      requestKey,
      networkId,
      chainId: chainId as ChainId,
    });
    return responses[requestKey];
  }

  async getBalanceByChainId(address: string, chainId: string): Promise<string> {
    const balance = await this.getBalanceAPI(
      this.displayAddress(address),
      chainId,
    );
    if (balance.result.status === 'failure') {
      const error = balance.result.error as { message: string | undefined };
      const message = error.message ?? 'Unknown error retrieving balances';
      // expected error when account does not exist on a chain (balance == 0)
      if (
        message.includes('row not found') ||
        message.includes('No value found in table')
      ) {
        return toBase('0', this.decimals);
      }
      throw new Error(message);
    }
    const balanceValue = parseFloat(
      balance.result.data.decimal
        ? balance.result.data.decimal
        : balance.result.data.toString(),
    ).toString();
    return toBase(balanceValue, this.decimals);
  }

  async getBalance(address: string): Promise<string> {
    const chainId = await this.getChainId();
    return this.getBalanceByChainId(address, chainId);
  }

  async getBalanceAPI(account: string, chainId: string) {
    const transaction = Pact.builder
      .execution((Pact.modules as any).coin['get-balance'](account))
      .setMeta({ chainId: chainId as ChainId })
      .setNetworkId(this.networkId)
      .createTransaction();

    return this.dirtyRead(transaction);
  }

  async sendLocalTransaction(
    signedTranscation: ICommand,
  ): Promise<ICommandResult> {
    const chainId = await this.getChainId();
    const client = createClient(this.getApiHost(chainId));
    return client.local(signedTranscation as ICommand);
  }

  async sendTransaction(
    signedTranscation: ICommand,
  ): Promise<ITransactionDescriptor> {
    const chainId = await this.getChainId();
    const client = createClient(this.getApiHost(chainId));
    return client.submit(signedTranscation as ICommand);
  }

  async listen(
    transactionDescriptor: ITransactionDescriptor,
  ): Promise<ICommandResult> {
    const chainId = await this.getChainId();
    const client = createClient(this.getApiHost(chainId));
    return client.listen(transactionDescriptor);
  }

  async dirtyRead(
    signedTranscation: ICommand | IUnsignedCommand,
  ): Promise<ICommandResult> {
    const chainId = await this.getChainId();
    const client = createClient(this.getApiHost(chainId));
    return client.dirtyRead(signedTranscation);
  }
}

export default API;
