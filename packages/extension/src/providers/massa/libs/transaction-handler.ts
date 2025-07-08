import { OperationOptions, Provider } from '@massalabs/massa-web3';


export class TransactionHandler {
  private provider: Provider;

  constructor(provider: Provider) {
    this.provider = provider;
  }

  // async createTransaction(
  //   from: string,
  //   to: string,
  //   amount: string,
  //   options: MassaTransactionOptions = {}
  // ): Promise<ITransactionData> {
  //   const { fee = '1000000', data = '', validityStartPeriod = 0 } = options;
  //   return {
  //     fee: BigInt(fee),
  //     amount: BigInt(amount),
  //     recipientAddress: to,
  //     senderAddress: from,
  //     data: data ? new TextEncoder().encode(data) : new Uint8Array(0),
  //     validityStartPeriod,
  //   };
  // }

  async sendTransaction(
    to: string,
    amount: string,
    options: OperationOptions = {}
  ): Promise<string> {
    const operation = await this.provider.transfer( to, BigInt(amount),options);
    return operation.id;
  }

  async getTransactionInfo(opId: string): Promise<any> {
    // TODO: Implement actual transaction info retrieval
    return { id: opId, status: 'pending' };
  }

  async estimateFee(): Promise<string> {
    // Massa has a fixed fee structure for now
    return '1000000';
  }
} 