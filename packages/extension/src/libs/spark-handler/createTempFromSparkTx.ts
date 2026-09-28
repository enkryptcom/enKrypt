import * as bitcoin from 'bitcoinjs-lib';
import { LOCK_TIME } from '@/libs/spark-handler/constants';
import { isSparkAddress } from '@/providers/bitcoin/libs/utils';

interface CreateTempFromSparkTxArgs {
  network: bitcoin.networks.Network;
  to: string;
  amountSat: number;
  sparkTxType: number;
}

interface CreateTempFromSparkTxResult {
  txHashSig: string;
  additionalTxSize: number;
}

export const createTempFromSparkTx = async ({
  network,
  amountSat,
  to,
  sparkTxType,
}: CreateTempFromSparkTxArgs): Promise<CreateTempFromSparkTxResult> => {
  const isSparkTransaction = await isSparkAddress(to);
  const tempTx = new bitcoin.Transaction();
  tempTx.version = 3 | (sparkTxType << 16);
  tempTx.locktime = LOCK_TIME;
  tempTx.addInput(
    Buffer.alloc(32, 0),
    4294967295,
    4294967295,
    Buffer.from('d3', 'hex'),
  );

  const baseTempTxBuffer = tempTx.toBuffer();

  if (!isSparkTransaction) {
    tempTx.addOutput(bitcoin.address.toOutputScript(to, network), amountSat);
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
