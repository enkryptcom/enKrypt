import Web3Eth, { FeeHistoryResult } from 'web3-eth';
import {
  EthereumTransaction,
  FinalizedFeeMarketEthereumTransaction,
  FinalizedLegacyEthereumTransaction,
  FormattedFeeHistory,
  GasCosts,
  TransactionOptions,
} from './types';
import { BNType, GasPriceTypes } from '@/providers/common/types';
import { numberToHex, toBN } from 'web3-utils';
import {
  GAS_PERCENTILES,
  formatFeeHistory,
  getBaseFeeBasedOnType,
  getGasBasedOnType,
  getPriorityFeeBasedOnType,
} from './gas-utils';
import { Hardfork, Common } from '@ethereumjs/common';
import { FeeMarketEIP1559Transaction, LegacyTransaction } from '@ethereumjs/tx';
import { OPTIMISM_PRICE_ORACLE, OPTIMISM_PRICE_ORACLE_ABI } from './op-data';
import { bufferToHex } from '@enkryptcom/utils';

/** Represents an EVM transaction */
class Transaction {
  tx: EthereumTransaction;
  web3: Web3Eth;
  constructor(tx: EthereumTransaction, web3: Web3Eth) {
    this.tx = tx;
    if (this.tx.gas) this.tx.gasLimit = this.tx.gas;
    this.web3 = web3;
  }
  async estimateGas(): Promise<number> {
    return this.web3.estimateGas({
      to: this.tx.to || undefined,
      from: this.tx.from,
      data: this.tx.data || '0x',
      value: this.tx.value || '0x0',
    });
  }
  async getOPfees(): Promise<BNType> {
    const OPContract = new this.web3.Contract(
      OPTIMISM_PRICE_ORACLE_ABI as any,
      OPTIMISM_PRICE_ORACLE,
    );
    const fTx = await this.getFinalizedTransaction({
      gasPriceType: GasPriceTypes.ECONOMY,
    });
    const serializedTx = fTx.serialize();
    return OPContract.methods
      .getL1Fee(bufferToHex(serializedTx))
      .call()
      .then((val: string) => toBN(val))
      .catch(() => toBN(0));
  }
  private getFeeMarketGasInfo = (
    baseFeePerGas: string,
    formattedFeeHistory: FormattedFeeHistory,
    priceType: GasPriceTypes,
  ) => {
    const adjustedBaseFeePerGas = getBaseFeeBasedOnType(
      baseFeePerGas,
      priceType,
    );
    const maxPriorityFeePerGas = getPriorityFeeBasedOnType(
      formattedFeeHistory,
      priceType,
    );
    const maxFeePerGas = adjustedBaseFeePerGas.add(maxPriorityFeePerGas);
    return {
      adjustedBaseFeePerGas,
      maxPriorityFeePerGas,
      maxFeePerGas,
    };
  };

  /**
   * Gathers the last bits of data required to serialize a transaction eg gas price, nonce, etc
   */
  async finalizeTransaction(options: TransactionOptions): Promise<{
    transaction:
      | FinalizedFeeMarketEthereumTransaction
      | FinalizedLegacyEthereumTransaction;
    gasPrice?: string;
    baseFeePerGas?: string;
    maxPriorityFeePerGas?: string;
    maxFeePerGas?: string;
    gasLimit: string;
    formattedFeeHistory?: FormattedFeeHistory;
  }> {
    const latestBlock = await this.web3.getBlock('latest', false);
    const { isFeeMarketNetwork, feeHistory } = await this.web3
      .getFeeHistory(6, 'latest', GAS_PERCENTILES)
      .then(history => ({
        isFeeMarketNetwork: !!latestBlock.baseFeePerGas,
        feeHistory: history,
      }))
      .catch(() => ({
        isFeeMarketNetwork: false,
        feeHistory: {} as FeeHistoryResult,
      }));
    // Gets the number of transactions that they will have sent by the next pending block
    const nonce = await this.web3.getTransactionCount(this.tx.from, 'pending');
    if (!isFeeMarketNetwork) {
      // Legacy transaction
      const gasPrice = await this.web3.getGasPrice();
      const gasLimit =
        this.tx.gasLimit ||
        (numberToHex(await this.estimateGas()) as `0x${string}`);
      const legacyTx: FinalizedLegacyEthereumTransaction = {
        to: this.tx.to || undefined,
        chainId: this.tx.chainId,
        data: this.tx.data || '0x',
        from: this.tx.from,
        gasLimit,
        gasPrice: !options.totalGasPrice
          ? (numberToHex(
              getGasBasedOnType(gasPrice, options.gasPriceType),
            ) as `0x${string}`)
          : (numberToHex(
              options.totalGasPrice.div(toBN(gasLimit)),
            ) as `0x${string}`),
        nonce: this.tx.nonce || (numberToHex(nonce) as `0x${string}`),
        value: this.tx.value || '0x0',
      };
      return {
        transaction: legacyTx,
        gasPrice: gasPrice,
        gasLimit: legacyTx.gasLimit,
      };
    } else {
      // Fee market transaction (post EIP1559)
      const baseFeePerGas =
        feeHistory.baseFeePerGas[feeHistory.baseFeePerGas.length - 2]; // -2 since -1 is the pending block
      const formattedFeeHistory = formatFeeHistory(feeHistory);
      const feeMarket = this.getFeeMarketGasInfo(
        baseFeePerGas!,
        formattedFeeHistory,
        options.gasPriceType,
      );
      const gasLimit =
        this.tx.gasLimit ||
        (numberToHex(await this.estimateGas()) as `0x${string}`);
      const maxFeePerGas = !options.totalGasPrice
        ? feeMarket.maxFeePerGas
        : options.totalGasPrice.div(toBN(gasLimit));
      const maxPriorityFeePerGas = feeMarket.maxPriorityFeePerGas;
      const feeMarketTx: FinalizedFeeMarketEthereumTransaction = {
        to: this.tx.to || undefined,
        chainId: this.tx.chainId,
        data: this.tx.data || '0x',
        from: this.tx.from,
        gasLimit,
        nonce: this.tx.nonce || (numberToHex(nonce) as `0x${string}`),
        value: this.tx.value || '0x0',
        maxFeePerGas: numberToHex(maxFeePerGas) as `0x${string}`,
        maxPriorityFeePerGas: numberToHex(
          maxPriorityFeePerGas.gt(maxFeePerGas)
            ? maxFeePerGas
            : maxPriorityFeePerGas,
        ) as `0x${string}`,
        type: '0x02',
        accessList: this.tx.accessList || [],
      };
      return {
        transaction: feeMarketTx,
        gasLimit: feeMarketTx.gasLimit,
        baseFeePerGas: numberToHex(baseFeePerGas!),
        maxFeePerGas: numberToHex(feeMarket.maxFeePerGas),
        maxPriorityFeePerGas: numberToHex(feeMarket.maxPriorityFeePerGas),
        formattedFeeHistory,
      };
    }
  }

  /**
   * Create a sendable transaction
   *
   * Gathers last live bits of data required to send the transaction then
   * creates a sendable transaction from it
   */
  async getFinalizedTransaction(
    options: TransactionOptions,
  ): Promise<LegacyTransaction | FeeMarketEIP1559Transaction> {
    const { transaction } = await this.finalizeTransaction(options);

    if (!transaction.maxFeePerGas) {
      const common = Common.custom({
        chainId: BigInt(transaction.chainId),
      });
      return LegacyTransaction.fromTxData(
        transaction as FinalizedLegacyEthereumTransaction,
        {
          common,
        },
      );
    } else {
      const common = Common.custom({
        chainId: BigInt(transaction.chainId),
        defaultHardfork: Hardfork.London,
      });
      return FeeMarketEIP1559Transaction.fromTxData(
        transaction as FinalizedFeeMarketEthereumTransaction,
        {
          common,
        },
      );
    }
  }

  async getMessageToSign(options: TransactionOptions): Promise<Uint8Array> {
    const tx = await this.getFinalizedTransaction(options);
    return tx.getHashedMessageToSign();
  }

  async getGasCosts(): Promise<GasCosts> {
    const { gasLimit, gasPrice, baseFeePerGas, formattedFeeHistory } =
      await this.finalizeTransaction({
        gasPriceType: GasPriceTypes.ECONOMY,
      });
    const opFee = await this.getOPfees();
    if (gasPrice) {
      return {
        [GasPriceTypes.ECONOMY]: numberToHex(
          getGasBasedOnType(gasPrice, GasPriceTypes.ECONOMY)
            .mul(toBN(gasLimit))
            .add(opFee),
        ),
        [GasPriceTypes.REGULAR]: numberToHex(
          getGasBasedOnType(gasPrice, GasPriceTypes.REGULAR)
            .mul(toBN(gasLimit))
            .add(opFee),
        ),
        [GasPriceTypes.FAST]: numberToHex(
          getGasBasedOnType(gasPrice, GasPriceTypes.FAST)
            .mul(toBN(gasLimit))
            .add(opFee),
        ),
        [GasPriceTypes.FASTEST]: numberToHex(
          getGasBasedOnType(gasPrice, GasPriceTypes.FASTEST)
            .mul(toBN(gasLimit))
            .add(opFee),
        ),
      };
    } else {
      return {
        [GasPriceTypes.ECONOMY]: numberToHex(
          this.getFeeMarketGasInfo(
            baseFeePerGas!,
            formattedFeeHistory!,
            GasPriceTypes.ECONOMY,
          )
            .maxFeePerGas.mul(toBN(gasLimit))
            .add(opFee),
        ),
        [GasPriceTypes.REGULAR]: numberToHex(
          this.getFeeMarketGasInfo(
            baseFeePerGas!,
            formattedFeeHistory!,
            GasPriceTypes.REGULAR,
          )
            .maxFeePerGas.mul(toBN(gasLimit))
            .add(opFee),
        ),
        [GasPriceTypes.FAST]: numberToHex(
          this.getFeeMarketGasInfo(
            baseFeePerGas!,
            formattedFeeHistory!,
            GasPriceTypes.FAST,
          )
            .maxFeePerGas.mul(toBN(gasLimit))
            .add(opFee),
        ),
        [GasPriceTypes.FASTEST]: numberToHex(
          this.getFeeMarketGasInfo(
            baseFeePerGas!,
            formattedFeeHistory!,
            GasPriceTypes.FASTEST,
          )
            .maxFeePerGas.mul(toBN(gasLimit))
            .add(opFee),
        ),
      };
    }
  }
}

export default Transaction;
