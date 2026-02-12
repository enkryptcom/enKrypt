import { ProviderAPIInterface } from '@/types/provider';
import { BTCRawInfo } from '@/types/activity';
import { ChronikClient } from 'chronik-client';
import { getAddress } from '../types/ecash-network';
import { ECashNetworkInfo, ChronikTx } from '../types/ecash-chronik';
import { Script, Address } from 'ecash-lib';
import { NetworkNames } from '@enkryptcom/types';

export class ChronikAPI extends ProviderAPIInterface {
  node: string;
  networkInfo: ECashNetworkInfo;
  private chronik: ChronikClient;

  public decimals: number;
  public name: NetworkNames;

  constructor(
    node: string,
    networkInfo: ECashNetworkInfo,
    decimals: number = 2,
    name: NetworkNames = NetworkNames.ECash,
  ) {
    super(node);
    this.node = node;
    this.networkInfo = networkInfo;
    this.chronik = new ChronikClient([node]);
    this.decimals = decimals;
    this.name = name;
  }

  async init(): Promise<void> {
    return this.withErrorHandling(
      'init',
      async () => {
        await this.chronik.blockchainInfo();
      },
      () => {
        throw new Error('Failed to initialize Chronik API');
      },
    );
  }

  private ensurePrefix(address: string): string {
    if (address.startsWith('ecash:') || address.startsWith('ectest:')) {
      return address;
    }
    return `${this.networkInfo.cashAddrPrefix}:${address}`;
  }

  private async withErrorHandling<T>(
    method: string,
    operation: () => Promise<T>,
    fallback: () => T,
  ): Promise<T> {
    try {
      return await operation();
    } catch (error) {
      console.error(`❌ [${method}] Error:`, error);
      return fallback();
    }
  }

  private calculateUTXOBalance(utxos: any[]): bigint {
    return utxos.reduce((total, utxo) => {
      if (!utxo.token) {
        const value = BigInt((utxo as any).sats || utxo.value || 0);
        return total + value;
      }
      return total;
    }, BigInt(0));
  }

  async getBalance(pubkey: string): Promise<string> {
    return this.withErrorHandling(
      'getBalance',
      async () => {
        const address = getAddress(pubkey);

        const addressWithPrefix = this.ensurePrefix(address);
        const utxoResponse = await this.chronik
          .address(addressWithPrefix)
          .utxos();

        const totalSatoshis = this.calculateUTXOBalance(utxoResponse.utxos);

        return totalSatoshis.toString();
      },
      () => '0',
    );
  }

  async getUTXOs(address: string): Promise<any[]> {
    return this.withErrorHandling(
      'getUTXOs',
      async () => {
        const addressWithPrefix = this.ensurePrefix(address);
        const utxoResponse = await this.chronik
          .address(addressWithPrefix)
          .utxos();
        return utxoResponse.utxos || [];
      },
      () => [],
    );
  }

  async getTransactionHistory(address: string): Promise<any[]> {
    return this.withErrorHandling(
      'getTransactionHistory',
      async () => {
        const addressWithPrefix = this.ensurePrefix(address);

        const history = await this.chronik.address(addressWithPrefix).history();
        return history.txs || [];
      },
      () => [],
    );
  }

  async getTransactionStatus(hash: string): Promise<BTCRawInfo | null> {
    return this.withErrorHandling(
      'getTransactionStatus',
      async () => {
        const tx = await this.chronik.tx(hash);

        if (!tx.block) {
          return null; // Transaction is in mempool
        }

        const rawInfo: BTCRawInfo = {
          blockNumber: tx.block.height,
          fee: this.calculateFee(tx as any),
          transactionHash: tx.txid,
          timestamp: tx.block.timestamp,
          inputs: tx.inputs.map((input: any) => ({
            address: this.scriptToAddress(input.outputScript || ''),
            value: input.value || '0',
            pkscript: input.outputScript || '',
          })),
          outputs: tx.outputs.map((output: any) => ({
            address: this.scriptToAddress(output.outputScript),
            value: output.value,
            pkscript: output.outputScript,
          })),
        };

        return rawInfo;
      },
      () => null,
    );
  }

  private calculateFee(tx: ChronikTx): number {
    const inputSum = tx.inputs.reduce(
      (sum, input) => sum + BigInt(input.value || 0),
      BigInt(0),
    );
    const outputSum = tx.outputs.reduce(
      (sum, output) => sum + BigInt(output.value || 0),
      BigInt(0),
    );
    return Number(inputSum - outputSum);
  }

  private scriptToAddress(scriptHex: string): string {
    if (!scriptHex) return '';

    try {
      const scriptBytes = Buffer.from(scriptHex, 'hex');
      const script = new Script(scriptBytes);
      const address = Address.fromScript(script);
      const fullAddress = address.toString();

      return fullAddress.split(':')[1] || fullAddress;
    } catch (error) {
      console.error(
        '[scriptToAddress] Invalid script:',
        scriptHex.slice(0, 20),
        error,
      );
      return '';
    }
  }
}

export default ChronikAPI;
