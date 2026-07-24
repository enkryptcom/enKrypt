// https://github.com/jlopp/bitcoin-transaction-size-calculator/blob/master/index.html

import { toBN } from 'web3-utils';
import { address as BTCAddress } from 'bitcoinjs-lib';
import { PaymentType } from '../../types/bitcoin-network';

enum InputScriptType {
  P2PKH = 'P2PKH',
  P2SH = 'P2SH',
  'P2SH-P2WPKH' = 'P2SH-P2WPKH',
  'P2SH-P2WSH' = 'P2SH-P2WSH',
  P2WPKH = 'P2WPKH',
  P2WSH = 'P2WSH',
  P2TR = 'P2TR',
}
const P2PKH_IN_SIZE = 148;
const P2PKH_OUT_SIZE = 34;

const P2SH_OUT_SIZE = 32;
const P2SH_P2WPKH_OUT_SIZE = 32;
const P2SH_P2WSH_OUT_SIZE = 32;

// All segwit input sizes are reduced by 1 WU to account for the witness item counts being added for every input per the transaction header
const P2SH_P2WPKH_IN_SIZE = 90.75;

const P2WPKH_IN_SIZE = 67.75;
const P2WPKH_OUT_SIZE = 31;

const P2WSH_OUT_SIZE = 43;
const P2TR_OUT_SIZE = 43;

const P2TR_IN_SIZE = 57.25;

const PUBKEY_SIZE = 33;
const SIGNATURE_SIZE = 72;

const getSizeOfVarInt = (length: number) => {
  if (length < 253) {
    return 1;
  } else if (length < 65535) {
    return 3;
  } else if (length < 4294967295) {
    return 5;
  } else if (length < toBN('18446744073709551615').toNumber()) {
    return 9;
  } else {
    alert('Invalid var int');
  }
};

const getSizeOfScriptLengthElement = (length: number) => {
  if (length < 75) {
    return 1;
  } else if (length <= 255) {
    return 2;
  } else if (length <= 65535) {
    return 3;
  } else if (length <= 4294967295) {
    return 5;
  } else {
    alert('Size of redeem script is too large');
  }
};

const getTxOverheadExtraRawBytes = (
  input_script: InputScriptType,
  input_count: number,
) => {
  let witness_bytes = 0;
  // Returns the remaining 3/4 bytes per witness bytes
  if (
    input_script !== InputScriptType.P2PKH &&
    input_script !== InputScriptType.P2SH
  ) {
    // Transactions with segwit inputs have extra overhead
    witness_bytes =
      0.25 + // segwit marker
      0.25 + // segwit flag
      input_count / 4; // witness element count per input
  }
  return witness_bytes * 3;
};

const getTxOverheadVBytes = (
  input_script: InputScriptType,
  input_count: number,
  output_count: number,
) => {
  let witness_vbytes = 0;
  if (
    input_script != InputScriptType.P2PKH &&
    input_script != InputScriptType.P2SH
  ) {
    // Transactions with segwit inputs have extra overhead
    witness_vbytes =
      0.25 + // segwit marker
      0.25 + // segwit flag
      input_count / 4; // witness element count per input
  }
  return (
    4 + // nVersion
    getSizeOfVarInt(input_count)! + // number of inputs
    getSizeOfVarInt(output_count)! + // number of outputs
    4 + // nLockTime
    witness_vbytes
  );
};

interface calcInputType {
  input_script?: InputScriptType;
  input_n?: number;
  input_m?: number;
  input_count: number;
}
interface calcOutputType {
  p2pkh_output_count?: number;
  p2sh_output_count?: number;
  p2sh_p2wpkh_output_count?: number;
  p2sh_p2wsh_output_count?: number;
  p2wpkh_output_count?: number;
  p2wsh_output_count?: number;
  p2tr_output_count?: number;
}
const calculateSize = (
  inputOptions: calcInputType,
  outputOptions: calcOutputType,
) => {
  const defaultInputOptions = {
    input_script: InputScriptType.P2WPKH,
    input_m: 1,
    input_n: 1,
  };
  const defaultOutputOptions = {
    p2pkh_output_count: 0,
    p2sh_output_count: 0,
    p2sh_p2wpkh_output_count: 0,
    p2sh_p2wsh_output_count: 0,
    p2wpkh_output_count: 0,
    p2wsh_output_count: 0,
    p2tr_output_count: 0,
  };
  const _inputOptions = { ...defaultInputOptions, ...inputOptions };
  const _outputOptions = { ...defaultOutputOptions, ...outputOptions };
  const { input_script, input_n, input_m, input_count } = _inputOptions;
  const {
    p2pkh_output_count,
    p2sh_output_count,
    p2sh_p2wpkh_output_count,
    p2sh_p2wsh_output_count,
    p2wpkh_output_count,
    p2wsh_output_count,
    p2tr_output_count,
  } = _outputOptions;

  const output_count =
    p2pkh_output_count +
    p2sh_output_count +
    p2sh_p2wpkh_output_count +
    p2sh_p2wsh_output_count +
    p2wpkh_output_count +
    p2wsh_output_count +
    p2tr_output_count;
  // In most cases the input size is predictable. For multisig inputs we need to perform a detailed calculation
  let inputSize = 0; // in virtual bytes
  let inputWitnessSize = 0;
  let redeemScriptSize = 0;
  let scriptSigSize = 0;
  switch (input_script) {
    case 'P2PKH':
      inputSize = P2PKH_IN_SIZE;
      break;
    case 'P2SH-P2WPKH':
      inputSize = P2SH_P2WPKH_IN_SIZE;
      inputWitnessSize = 107; // size(signature) + signature + size(pubkey) + pubkey
      break;
    case 'P2WPKH':
      inputSize = P2WPKH_IN_SIZE;
      inputWitnessSize = 107; // size(signature) + signature + size(pubkey) + pubkey
      break;
    case 'P2TR': // Only consider the cooperative taproot signing path; assume multisig is done via aggregate signatures
      inputSize = P2TR_IN_SIZE;
      inputWitnessSize = 65; // getSizeOfVarInt(schnorrSignature) + schnorrSignature;
      break;
    case 'P2SH':
      redeemScriptSize =
        1 + // OP_M
        input_n * (1 + PUBKEY_SIZE) + // OP_PUSH33 <pubkey>
        1 + // OP_N
        1; // OP_CHECKMULTISIG
      scriptSigSize =
        1 + // size(0)
        input_m * (1 + SIGNATURE_SIZE) + // size(SIGNATURE_SIZE) + signature
        getSizeOfScriptLengthElement(redeemScriptSize)! +
        redeemScriptSize;
      inputSize = 32 + 4 + getSizeOfVarInt(scriptSigSize)! + scriptSigSize + 4;
      break;
    case 'P2SH-P2WSH':
    case 'P2WSH':
      redeemScriptSize =
        1 + // OP_M
        input_n * (1 + PUBKEY_SIZE) + // OP_PUSH33 <pubkey>
        1 + // OP_N
        1; // OP_CHECKMULTISIG
      inputWitnessSize =
        1 + // size(0)
        input_m * (1 + SIGNATURE_SIZE) + // size(SIGNATURE_SIZE) + signature
        getSizeOfScriptLengthElement(redeemScriptSize)! +
        redeemScriptSize;
      inputSize =
        36 + // outpoint (spent UTXO ID)
        inputWitnessSize / 4 + // witness program
        4; // nSequence
      if (input_script == 'P2SH-P2WSH') {
        inputSize += 32 + 3; // P2SH wrapper (redeemscript hash) + overhead?
      }
  }
  const txVBytes =
    getTxOverheadVBytes(input_script, input_count, output_count) +
    inputSize * input_count +
    P2PKH_OUT_SIZE * p2pkh_output_count +
    P2SH_OUT_SIZE * p2sh_output_count +
    P2SH_P2WPKH_OUT_SIZE * p2sh_p2wpkh_output_count +
    P2SH_P2WSH_OUT_SIZE * p2sh_p2wsh_output_count +
    P2WPKH_OUT_SIZE * p2wpkh_output_count +
    P2WSH_OUT_SIZE * p2wsh_output_count +
    P2TR_OUT_SIZE * p2tr_output_count;
  const txBytes =
    getTxOverheadExtraRawBytes(input_script, input_count)! +
    txVBytes +
    (inputWitnessSize * input_count * 3) / 4;
  const txWeight = txVBytes * 4;
  return {
    txVBytes,
    txBytes,
    txWeight,
  };
};
/**
 * Bucket an output address into the counter `calculateSize` uses for it.
 *
 * Only bech32/bech32m outputs are classified. Those are the ones whose size
 * differs enough from the account's own output type to matter: a P2TR or P2WSH
 * output is 43 vB against 31 vB for P2WPKH, which is the difference between a
 * transaction relaying and being dropped for paying under the minimum fee rate.
 * Anything else falls back to the account's own type, which is at most 3 vB out.
 */
const getOutputCounterForAddress = (
  address: string,
): keyof calcOutputType | undefined => {
  let decoded: { version: number; data: Buffer };
  try {
    decoded = BTCAddress.fromBech32(address);
  } catch {
    return undefined;
  }
  if (decoded.version === 0) {
    if (decoded.data.length === 20) return 'p2wpkh_output_count';
    if (decoded.data.length === 32) return 'p2wsh_output_count';
  } else if (decoded.version === 1 && decoded.data.length === 32) {
    return 'p2tr_output_count';
  }
  return undefined;
};

/**
 * `outputAddresses` describes the outputs that are already known, in order. Any
 * output without a matching entry — the change output, or a recipient address
 * that is still being typed — is sized as the account's own payment type.
 */
const calculateSizeBasedOnType = (
  numInputs: number,
  numOutputs: number,
  type: PaymentType,
  outputAddresses: string[] = [],
): number => {
  const defaultCounter: keyof calcOutputType =
    type === PaymentType.P2PKH ? 'p2pkh_output_count' : 'p2wpkh_output_count';
  const output: calcOutputType = {};
  for (let i = 0; i < numOutputs; i++) {
    const counter =
      (outputAddresses[i] && getOutputCounterForAddress(outputAddresses[i])) ||
      defaultCounter;
    output[counter] = (output[counter] ?? 0) + 1;
  }
  const size = calculateSize(
    {
      input_script:
        type === PaymentType.P2PKH
          ? InputScriptType.P2PKH
          : InputScriptType.P2WPKH,
      input_count: numInputs,
    },
    output,
  );
  return type === PaymentType.P2PKH ? size.txBytes : size.txVBytes;
};
export {
  InputScriptType,
  calculateSize,
  calculateSizeBasedOnType,
  getOutputCounterForAddress,
};
