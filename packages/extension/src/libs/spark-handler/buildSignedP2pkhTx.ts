import { validator } from '@/providers/bitcoin/libs/firo-wallet/base-firo-wallet';
import * as bitcoin from 'bitcoinjs-lib';
import { ECPairInterface } from 'ecpair';

interface BuildSignedP2pkhTxArgs {
  network: bitcoin.networks.Network;
  utxos: { address: string; txid: string; vout: number }[];
  addressKeyPairs: Record<string, ECPairInterface>;
  outputs: (
    | { script: Buffer; value: number }
    | { address: string; value: number }
  )[];
}

// Signs legacy P2PKH inputs directly instead of via Psbt. Psbt requires the
// full previous tx (nonWitnessUtxo), which bitcoinjs cannot parse for Firo
// special txs (Spark spends, coinbase) because of their extra payload.
export const buildSignedP2pkhTx = ({
  network,
  utxos,
  addressKeyPairs,
  outputs,
}: BuildSignedP2pkhTxArgs) => {
  const tx = new bitcoin.Transaction();
  tx.version = 2;

  utxos.forEach(utxo => {
    tx.addInput(Buffer.from(utxo.txid, 'hex').reverse(), utxo.vout);
  });

  outputs.forEach(output => {
    const script =
      'script' in output
        ? output.script
        : bitcoin.address.toOutputScript(output.address, network);
    tx.addOutput(script, output.value);
  });

  utxos.forEach((utxo, index) => {
    const keyPair = addressKeyPairs[utxo.address];
    if (!keyPair) throw new Error(`Missing key for ${utxo.address}`);

    const pubkey = Buffer.from(keyPair.publicKey);
    const prevOutScript = bitcoin.address.toOutputScript(
      utxo.address,
      network,
    );
    const hash = tx.hashForSignature(
      index,
      prevOutScript,
      bitcoin.Transaction.SIGHASH_ALL,
    );
    const signature = Buffer.from(keyPair.sign(hash));

    if (!validator(pubkey, hash, signature)) {
      throw new Error('Error: Some inputs were not signed!');
    }

    const { input } = bitcoin.payments.p2pkh({
      pubkey,
      signature: bitcoin.script.signature.encode(
        signature,
        bitcoin.Transaction.SIGHASH_ALL,
      ),
      network,
    });
    tx.setInputScript(index, input!);
  });

  return tx;
};
