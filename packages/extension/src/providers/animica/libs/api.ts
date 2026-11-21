import { ProviderAPIInterface } from '@/types/provider';
import { AnimicaRawInfo } from '@/types/activity';

export interface AnimicaHead {
  height: number;
  hash: string;
  chainId: number;
}

export interface AnimicaRPCError extends Error {
  code?: number;
  data?: unknown;
}

export default class AnimicaAPI extends ProviderAPIInterface {
  public node: string;

  constructor(node: string) {
    super(node);
    this.node = node;
  }

  public get api() {
    return this;
  }

  async init(): Promise<void> {}

  async request<T>(method: string, params: unknown[] = []): Promise<T> {
    const response = await fetch(this.node, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ jsonrpc: '2.0', id: 1, method, params }),
    });
    if (!response.ok) {
      throw new Error(`Animica RPC ${method} failed: HTTP ${response.status}`);
    }
    const json = await response.json();
    if (json.error) {
      const error: AnimicaRPCError = new Error(
        json.error.message ?? `Animica RPC ${method} failed`,
      );
      error.code = json.error.code;
      error.data = json.error.data;
      throw error;
    }
    return json.result as T;
  }

  /** Balance in nANM (1 ANM = 1e9 nANM) as a decimal string. */
  async getBalance(address: string): Promise<string> {
    const balance = await this.request<string>('state.getBalance', [address]);
    return BigInt(balance).toString();
  }

  async getHead(): Promise<AnimicaHead> {
    return this.request<AnimicaHead>('chain.getHead');
  }

  /** Gas price in nANM per gas unit (the node never goes below 1). */
  async getGasPrice(): Promise<string> {
    const price = BigInt(await this.request<string>('eth_gasPrice'));
    return (price > 1n ? price : 1n).toString();
  }

  async getTransactionStatus(hash: string): Promise<AnimicaRawInfo | null> {
    try {
      return await this.request<AnimicaRawInfo>('tx.getStatus', [hash]);
    } catch {
      return null;
    }
  }

  /**
   * Runs the node's full admission path (decode, chain id, ML-DSA-65
   * signature, balance) without broadcasting; throws the node's error.
   */
  async simulateAdmission(rawTx: string): Promise<void> {
    await this.request('mempool.simulateAdmission', [rawTx]);
  }

  /** Pre-flights then broadcasts a signed transaction; returns the tx hash. */
  async broadcast(rawTx: string): Promise<string> {
    await this.simulateAdmission(rawTx);
    return this.request<string>('tx.sendRawTransaction', [rawTx]);
  }
}
