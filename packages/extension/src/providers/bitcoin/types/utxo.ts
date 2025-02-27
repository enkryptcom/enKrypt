import { ECPairInterface } from 'ecpair';

export interface Utxo {
  keyPair: ECPairInterface;
  address: string;
  txid: string;
  vout: number;
  scriptPubKey: string;
  amount: number;
  satoshis: number;
  confirmations: number;
  ts: number;
}
