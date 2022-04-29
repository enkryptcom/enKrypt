import Web3 from "web3";
import {
  EthereumTransaction,
  FinalizedFeeMarketEthereumTransaction,
  FinalizedLegacyEthereumTransaction,
  GasPriceTypes,
} from "./types";
import { numberToHex, toBN } from "web3-utils";
import { getBaseFeeBasedOnType, getPriorityFeeBasedOnType } from "./gas-utils";
import Common, { Hardfork } from "@ethereumjs/common";
import {
  FeeMarketEIP1559Transaction,
  Transaction as LegacyTransaction,
} from "@ethereumjs/tx";
class Transaction {
  tx: EthereumTransaction;
  web3: Web3;
  constructor(tx: EthereumTransaction, web3: Web3) {
    this.tx = tx;
    if (this.tx.gas) this.tx.gasLimit = this.tx.gas;
    this.web3 = web3;
  }
  async estimateGas(): Promise<number> {
    return this.web3.eth.estimateGas({
      to: this.tx.to || undefined,
      from: this.tx.from,
      data: this.tx.data || "0x",
    });
  }
  async finalizeTransaction(): Promise<
    FinalizedFeeMarketEthereumTransaction | FinalizedLegacyEthereumTransaction
  > {
    const { isFeeMarketNetwork, baseFeePerGas } = await this.web3.eth
      .getBlockNumber()
      .then((blockNum) => {
        return this.web3.eth.getBlock(blockNum, false).then((block) => {
          return {
            isFeeMarketNetwork: !!block.baseFeePerGas,
            baseFeePerGas: block.baseFeePerGas,
          };
        });
      });
    const gasPrice = await this.web3.eth.getGasPrice();
    const nonce = await this.web3.eth.getTransactionCount(
      this.tx.from,
      "pending"
    );
    if (!isFeeMarketNetwork) {
      const legacyTx: FinalizedLegacyEthereumTransaction = {
        to: this.tx.to || undefined,
        chainId: this.tx.chainId,
        data: this.tx.data || "0x",
        from: this.tx.from,
        gasLimit:
          this.tx.gasLimit ||
          (numberToHex(await this.estimateGas()) as `0x${string}`),
        gasPrice: numberToHex(gasPrice) as `0x${string}`,
        nonce: this.tx.nonce || (numberToHex(nonce) as `0x${string}`),
        value: this.tx.value || "0x0",
      };
      return legacyTx;
    } else {
      let maxFeePerGas = getBaseFeeBasedOnType(
        baseFeePerGas?.toString() as string,
        GasPriceTypes.REGULAR
      );
      const maxPriorityFeePerGas = getPriorityFeeBasedOnType(
        baseFeePerGas?.toString() as string,
        gasPrice.toString(),
        GasPriceTypes.REGULAR
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
      return feeMarketTx;
    }
  }
  async getFinalizedTransaction(): Promise<
    LegacyTransaction | FeeMarketEIP1559Transaction
  > {
    const finalizedTx = await this.finalizeTransaction();

    if (!finalizedTx.maxFeePerGas) {
      const common = Common.custom({
        chainId: toBN(finalizedTx.chainId),
      });
      return LegacyTransaction.fromTxData(
        finalizedTx as FinalizedLegacyEthereumTransaction,
        {
          common,
        }
      );
    } else {
      const common = Common.custom({
        chainId: toBN(finalizedTx.chainId),
        defaultHardfork: Hardfork.London,
      });
      return FeeMarketEIP1559Transaction.fromTxData(
        finalizedTx as FinalizedFeeMarketEthereumTransaction,
        {
          common,
        }
      );
    }
  }
  async getMessageToSign(): Promise<Buffer> {
    const tx = await this.getFinalizedTransaction();
    return tx.getMessageToSign(true);
  }
}

export default Transaction;
