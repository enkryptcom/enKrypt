import BigNumber from 'bignumber.js';
import * as bitcoin from 'bitcoinjs-lib';
import { ECPairInterface } from 'ecpair';
import { buildSignedP2pkhTx } from '@/libs/spark-handler/buildSignedP2pkhTx';

interface CreateTempTxArgs {
  network: bitcoin.networks.Network;
  changeAmount?: BigNumber;
  mintValueOutput: {
    script: Buffer;
    value: number;
  }[];
  spendableUtxos: {
    address: string;
    txid: string;
    vout: number;
  }[];
  addressKeyPairs: Record<string, ECPairInterface>;
}

export const createTempTx = ({
  network,
  spendableUtxos,
  addressKeyPairs,
  mintValueOutput,
  changeAmount,
}: CreateTempTxArgs) => {
  const outputs: Parameters<typeof buildSignedP2pkhTx>[0]['outputs'] = [
    ...mintValueOutput,
  ];

  if (changeAmount && changeAmount.gt(0)) {
    outputs.push({
      address: spendableUtxos[0]!.address,
      value: changeAmount.toNumber(),
    });
  }

  return buildSignedP2pkhTx({
    network,
    utxos: spendableUtxos,
    addressKeyPairs,
    outputs,
  });
};
