import * as bitcoin from 'bitcoinjs-lib';
import { LOCK_TIME, SPARK_TX_TYPE } from '@/libs/spark-handler/constants';
import { isSparkAddress } from '@/providers/bitcoin/libs/utils';

interface CreateTempFromSparkTxArgs {
  network: bitcoin.networks.Network;
  to: string;
  amount: string;
}

// TODO: please check do we need all this temTx stuff if we only using **txHashSig**

export const createTempFromSparkTx = async ({
  network,
  amount,
  to,
}: CreateTempFromSparkTxArgs): Promise<string> => {
  const isSparkTransaction = await isSparkAddress(to);

  const tempTx = new bitcoin.Psbt({ network });
  tempTx.setVersion(3 | (SPARK_TX_TYPE << 16)); // version 3 and tx type in high bits (3 | (SPARK_TX_TYPE << 16));
  tempTx.setLocktime(LOCK_TIME); // new Date().getTime() / 1000

  tempTx.addInput({
    hash: '0000000000000000000000000000000000000000000000000000000000000000',
    index: 4294967295,
    sequence: 4294967295,
    finalScriptSig: Buffer.from('d3', 'hex'),
  });

  const tempTxBuffer = tempTx.extractTransaction(true).toBuffer();
  const extendedTempTxBuffer = Buffer.concat([
    tempTxBuffer,
    Buffer.from([0x00]),
  ]);

  const txHash = bitcoin.crypto.hash256(extendedTempTxBuffer);
  const txHashSig = txHash.reverse().toString('hex');

  // TODO: check not spark case
  if (!isSparkTransaction) {
    tempTx.addOutput({
      address: to,
      value: parseFloat(amount),
    });
  }

  return txHashSig;
};
