import { validator } from '@/providers/bitcoin/libs/firo-wallet/firo-wallet';
import BigNumber from 'bignumber.js';
import * as bitcoin from 'bitcoinjs-lib';
import { ECPairInterface } from 'ecpair';

interface CreateTempTxArgs {
  network: bitcoin.networks.Network;
  changeAmount: BigNumber;
  mintValueOutput: {
    script: Buffer<ArrayBuffer>;
    value: number;
  }[];
  inputs: {
    hash: string;
    index: number;
    nonWitnessUtxo: Buffer<ArrayBuffer>;
  }[];
  spendableUtxos: {
    keyPair: ECPairInterface;
    address: string;
    txid: string;
    vout: number;
    scriptPubKey: string;
    amount: number;
    satoshis: number;
    confirmations: number;
    ts: number;
  }[];
  addressKeyPairs: Record<string, any>;
}

export const createTempTx = ({
  network,
  inputs,
  spendableUtxos,
  addressKeyPairs,
  mintValueOutput,
  changeAmount,
}: CreateTempTxArgs) => {
  const tx = new bitcoin.Psbt({ network });
  tx.setVersion(2);

  inputs.forEach(input => {
    tx.addInput(input);
  });

  mintValueOutput.forEach(mint => {
    tx.addOutput({
      script: mint.script,
      value: mint.value,
    });
  });

  if (changeAmount.gt(0)) {
    const firstUtxoAddress = spendableUtxos[0].address;

    tx.addOutput({
      address: firstUtxoAddress!,
      value: changeAmount.toNumber(),
    });
  }

  for (let index = 0; index < spendableUtxos.length; index++) {
    const utxo = spendableUtxos[index];
    const keyPair = addressKeyPairs[utxo.address];

    console.log(
      `🔹 Signing input ${index} with key ${keyPair.publicKey.toString('hex')}`,
    );

    const Signer = {
      sign: (hash: Uint8Array) => {
        return Buffer.from(keyPair.sign(hash));
      },
      publicKey: Buffer.from(keyPair.publicKey),
    } as unknown as bitcoin.Signer;

    tx.signInput(index, Signer);
    console.log(`🔹 Siged input ${index}`);
  }
  tx.validateSignaturesOfAllInputs(validator);
  tx.finalizeAllInputs();

  return tx.extractTransaction();
};
