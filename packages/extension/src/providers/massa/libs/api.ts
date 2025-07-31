import { ProviderAPIInterface } from '@/types/provider';
import { JsonRpcPublicProvider, OperationStatus } from '@massalabs/massa-web3';

export default class MassaAPI extends ProviderAPIInterface {
  public provider: JsonRpcPublicProvider;
  public node: string;

  constructor(node: string) {
    super(node);
    this.node = node;
    this.provider = JsonRpcPublicProvider.fromRPCUrl(
      node,
    ) as JsonRpcPublicProvider;
  }

  public get api() {
    return this;
  }

  async init(): Promise<void> {}

  async getBalance(address: string): Promise<string> {
    const [account] = await this.provider.balanceOf([address], false);
    if (!account) return '0';
    return account.balance.toString();
  }

  async getMinimalFee(): Promise<string> {
    try {
      const networkInfo = await this.provider.networkInfos();
      return networkInfo.minimalFee.toString();
    } catch (error) {
      // Return a default minimal fee if network info is not available
      return '10000000'; // 0.01 MAS in base units (9 decimals)
    }
  }

  async getTransactionStatus(opId: string): Promise<OperationStatus | null> {
    try {
      return this.provider.getOperationStatus(opId);
    } catch (error) {
      return null;
    }
  }

  async getNodeStatus(): Promise<any> {
    return this.provider.getNodeStatus();
  }
}
