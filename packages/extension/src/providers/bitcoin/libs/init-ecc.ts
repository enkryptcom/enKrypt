import * as ecc from '@bitcoinerlab/secp256k1';
import { initEccLib } from 'bitcoinjs-lib';

/**
 * bitcoinjs-lib does not bundle an elliptic curve implementation. Anything
 * taproot related throws `No ECC Library provided` until one is registered,
 * which makes `address.toOutputScript` reject every `bc1p...` address and, in
 * turn, makes taproot recipients look invalid and unspendable to.
 *
 * Importing this module for its side effect registers the curve once. Import it
 * from any module that validates addresses or builds output scripts.
 */
initEccLib(ecc);
