import Web3Eth from "web3-eth";
import {
  EthereumTransaction,
  FinalizedFeeMarketEthereumTransaction,
  FinalizedLegacyEthereumTransaction,
  GasCosts,
  TransactionOptions,
} from "./types";
import { GasPriceTypes } from "@/providers/common/types";
import { numberToHex, toBN } from "web3-utils";
import {
  getBaseFeeBasedOnType,
  getGasBasedOnType,
  getPriorityFeeBasedOnType,
} from "./gas-utils";
import { Hardfork, Common } from "@ethereumjs/common";
import {
  FeeMarketEIP1559Transaction,
  Transaction as LegacyTransaction,
} from "@ethereumjs/tx";
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
      data: this.tx.data || "0x",
      value: this.tx.value || "0x0",
    });
  }
  async finalizeTransaction(options: TransactionOptions): Promise<{
    transaction:
      | FinalizedFeeMarketEthereumTransaction
      | FinalizedLegacyEthereumTransaction;
    gasPrice?: string;
    baseFeePerGas?: string;
    maxPriorityFeePerGas?: string;
    maxFeePerGas?: string;
    gasLimit: string;
  }> {
    const { isFeeMarketNetwork, baseFeePerGas } = await this.web3
      .getBlockNumber()
      .then((blockNum) => {
        return this.web3.getBlock(blockNum, false).then((block) => {
          return {
            isFeeMarketNetwork: !!block.baseFeePerGas,
            baseFeePerGas: block.baseFeePerGas,
          };
        });
      });
    const gasPrice = await this.web3.getGasPrice();
    const nonce = await this.web3.getTransactionCount(this.tx.from, "pending");
    if (!isFeeMarketNetwork) {
      const legacyTx: FinalizedLegacyEthereumTransaction = {
        to: this.tx.to || undefined,
        chainId: this.tx.chainId,
        data: this.tx.data || "0x",
        from: this.tx.from,
        gasLimit:
          this.tx.gasLimit ||
          (numberToHex(await this.estimateGas()) as `0x${string}`),
        gasPrice: numberToHex(
          getGasBasedOnType(gasPrice, options.gasPriceType)
        ) as `0x${string}`,
        nonce: this.tx.nonce || (numberToHex(nonce) as `0x${string}`),
        value: this.tx.value || "0x0",
      };
      return {
        transaction: legacyTx,
        gasPrice: gasPrice,
        gasLimit: legacyTx.gasLimit,
      };
    } else {
      let maxFeePerGas = getBaseFeeBasedOnType(
        baseFeePerGas?.toString() as string,
        options.gasPriceType
      );
      const maxPriorityFeePerGas = getPriorityFeeBasedOnType(
        baseFeePerGas?.toString() as string,
        gasPrice.toString(),
        options.gasPriceType
      );
      if (maxPriorityFeePerGas.gt(maxFeePerGas)) {
        maxFeePerGas = maxPriorityFeePerGas;
      }
      const feeMarketTx: FinalizedFeeMarketEthereumTransaction = {
        to: this.tx.to || undefined,
        chainId: this.tx.chainId,
        data: this.tx.data || "0x",
        from: this.tx.from,
        gasLimit:
          this.tx.gasLimit ||
          (numberToHex(await this.estimateGas()) as `0x${string}`),
        nonce: this.tx.nonce || (numberToHex(nonce) as `0x${string}`),
        value: this.tx.value || "0x0",
        maxFeePerGas: numberToHex(maxFeePerGas) as `0x${string}`,
        maxPriorityFeePerGas: numberToHex(
          maxPriorityFeePerGas
        ) as `0x${string}`,
        type: "0x02",
        accessList: this.tx.accessList || [],
      };
      return {
        transaction: feeMarketTx,
        gasLimit: feeMarketTx.gasLimit,
        baseFeePerGas: numberToHex(baseFeePerGas!),
        maxFeePerGas: numberToHex(maxFeePerGas),
        maxPriorityFeePerGas: numberToHex(maxPriorityFeePerGas),
      };
    }
  }
  async getFinalizedTransaction(
    options: TransactionOptions
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
        }
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
        }
      );
    }
  }
  async getMessageToSign(options: TransactionOptions): Promise<Buffer> {
    const tx = await this.getFinalizedTransaction(options);
    return tx.getMessageToSign(true);
  }
  async getGasCosts(): Promise<GasCosts> {
    const { gasLimit, gasPrice, baseFeePerGas } =
      await this.finalizeTransaction({
        gasPriceType: GasPriceTypes.ECONOMY,
      });
    if (gasPrice) {
      return {
        [GasPriceTypes.ECONOMY]: numberToHex(
          getGasBasedOnType(gasPrice, GasPriceTypes.ECONOMY).mul(toBN(gasLimit))
        ),
        [GasPriceTypes.REGULAR]: numberToHex(
          getGasBasedOnType(gasPrice, GasPriceTypes.REGULAR).mul(toBN(gasLimit))
        ),
        [GasPriceTypes.FAST]: numberToHex(
          getGasBasedOnType(gasPrice, GasPriceTypes.FAST).mul(toBN(gasLimit))
        ),
        [GasPriceTypes.FASTEST]: numberToHex(
          getGasBasedOnType(gasPrice, GasPriceTypes.FASTEST).mul(toBN(gasLimit))
        ),
      };
    } else {
      return {
        [GasPriceTypes.ECONOMY]: numberToHex(
          getBaseFeeBasedOnType(baseFeePerGas!, GasPriceTypes.ECONOMY).mul(
            toBN(gasLimit)
          )
        ),
        [GasPriceTypes.REGULAR]: numberToHex(
          getBaseFeeBasedOnType(baseFeePerGas!, GasPriceTypes.REGULAR).mul(
            toBN(gasLimit)
          )
        ),
        [GasPriceTypes.FAST]: numberToHex(
          getBaseFeeBasedOnType(baseFeePerGas!, GasPriceTypes.FAST).mul(
            toBN(gasLimit)
          )
        ),
        [GasPriceTypes.FASTEST]: numberToHex(
          getBaseFeeBasedOnType(baseFeePerGas!, GasPriceTypes.FASTEST).mul(
            toBN(gasLimit)
          )
        ),
      };
    }
  }
}

export default Transaction;
