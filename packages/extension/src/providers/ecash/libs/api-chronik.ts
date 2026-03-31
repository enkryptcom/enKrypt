import { ProviderAPIInterface } from '@/types/provider';
import { BTCRawInfo } from '@/types/activity';
import { ChronikClient } from 'chronik-client';
import { WatchOnlyWallet } from 'ecash-wallet';
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
        await this.chronik.chronikInfo();
      },
      () => {
        throw new Error('Failed to initialize Chronik API');
      },
    );
  }

  private ensurePrefix(address: string): string {
    if (address.includes(':')) {
      return address;
    }
    return `${this.networkInfo.cashAddrPrefix}:${address}`;
  }

  private async withErrorHandling<T>(
    method: string,
    operation: () => Promise<T>,
    fallback?: () => T | Promise<T>,
  ): Promise<T> {
    try {
      return await operation();
    } catch (error) {
      console.error(`[ChronikAPI:${method}]`, error);
      if (fallback) return await fallback();
      throw error;
    }
  }

  async getBalance(pubkey: string): Promise<string> {
    return this.withErrorHandling(
      'getBalance',
      async () => {
        const address = this.ensurePrefix(
          getAddress(pubkey, this.networkInfo.cashAddrPrefix),
        );
        const wallet = WatchOnlyWallet.fromAddress(address, this.chronik);
        await wallet.sync();
        return wallet.balanceSats.toString();
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

  async getTransactionHistory(address: string): Promise<ChronikTx[]> {
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

        const rawInfo: BTCRawInfo = {
          blockNumber: tx.block?.height ?? 0,
          fee: this.calculateFee(tx as any),
          transactionHash: tx.txid,
          timestamp: tx.block?.timestamp ?? Math.floor(Date.now() / 1000),
          inputs: tx.inputs.map(input => ({
            address: this.scriptToAddress(input.outputScript ?? ''),
            value: Number(input.sats),
            pkscript: input.outputScript ?? '',
          })),
          outputs: tx.outputs.map(output => ({
            address: this.scriptToAddress(output.outputScript),
            value: Number(output.sats),
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
      (sum, input) => sum + input.sats,
      BigInt(0),
    );
    const outputSum = tx.outputs.reduce(
      (sum, output) => sum + output.sats,
      BigInt(0),
    );
    return Number(inputSum - outputSum);
  }

  private scriptToAddress(scriptHex: string): string {
    if (!scriptHex) return '';

    try {
      const scriptBytes = Buffer.from(scriptHex, 'hex');
      const script = new Script(scriptBytes);
      const fullAddress = Address.fromScript(
        script,
        this.networkInfo.cashAddrPrefix,
      ).toString();

      return fullAddress.split(':')[1] || fullAddress;
    } catch (error) {
      console.error(
        '[scriptToAddress] Could not derive address from script, only p2pkh and p2sh are supported:',
        scriptHex.slice(0, 20),
        error,
      );
      return '';
    }
  }
}

export default ChronikAPI;
