import * as bitcoin from 'bitcoinjs-lib';
import { LOCK_TIME, SPARK_TX_TYPE } from '@/libs/spark-handler/constants';
import { isSparkAddress } from '@/providers/bitcoin/libs/utils';
import BigNumber from 'bignumber.js';

interface CreateTempFromSparkTxArgs {
  network: bitcoin.networks.Network;
  to: string;
  amount: string;
}

interface CreateTempFromSparkTxResult {
  txHashSig: string;
  additionalTxSize: number;
}

export const createTempFromSparkTx = async ({
  network,
  amount,
  to,
}: CreateTempFromSparkTxArgs): Promise<CreateTempFromSparkTxResult> => {
  const isSparkTransaction = await isSparkAddress(to);
  const tempTx = new bitcoin.Transaction();
  tempTx.version = 3 | (SPARK_TX_TYPE << 16);
  tempTx.locktime = LOCK_TIME;
  tempTx.addInput(
    Buffer.alloc(32, 0),
    4294967295,
    4294967295,
    Buffer.from('d3', 'hex'),
  );

  const baseTempTxBuffer = tempTx.toBuffer();

  if (!isSparkTransaction) {
    tempTx.addOutput(
      bitcoin.address.toOutputScript(to, network),
      new BigNumber(amount).multipliedBy(10 ** 8).toNumber(),
    );
  }

  const fullTempTxBuffer = tempTx.toBuffer();
  const extendedTempTxBuffer = Buffer.concat([
    fullTempTxBuffer,
    Buffer.from([0x00]),
  ]);

  const txHash = bitcoin.crypto.hash256(extendedTempTxBuffer);
  return {
    txHashSig: txHash.reverse().toString('hex'),
    additionalTxSize: fullTempTxBuffer.length - baseTempTxBuffer.length,
  };
};
