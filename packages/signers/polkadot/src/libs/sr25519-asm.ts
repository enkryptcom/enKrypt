import { asmJsInit } from "@polkadot/wasm-crypto-asmjs/cjs/data";
import * as imports from "@polkadot/wasm-crypto/imports";
import {
  initWasm,
  getWasm,
  allocU8a,
  resultU8a,
} from "@polkadot/wasm-crypto/bridge";
import { wasmBytes } from "@polkadot/wasm-crypto-wasm";
import { sr25519PairFromU8a } from "@polkadot/util-crypto/sr25519/pair/fromU8a";
import { u8aToU8a } from "@polkadot/util";
import { Keypair } from "@polkadot/util-crypto/types";
import { DeriveJunction } from "@polkadot/util-crypto/key/DeriveJunction";
import { createDeriveFn } from "@polkadot/util-crypto/sr25519/derive";

export const initASMWasm = (): void => {
  initWasm(wasmBytes, asmJsInit, imports);
};
export const sr25519SignASM = (
  message: Uint8Array,
  { publicKey, secretKey }: Partial<Keypair>
): Uint8Array => {
  initASMWasm();
  getWasm().ext_sr_sign(
    8,
    ...allocU8a(publicKey),
    ...allocU8a(secretKey),
    ...allocU8a(u8aToU8a(message))
  );
  return resultU8a();
};
export const sr25519KeypairFromSeedASM = (seed: Uint8Array): Keypair => {
  const seedU8a = u8aToU8a(seed);
  initASMWasm();
  getWasm().ext_sr_from_seed(8, ...allocU8a(seedU8a));
  return sr25519PairFromU8a(resultU8a());
};
export const sr25519DeriveKeypairHard = (
  pair: Uint8Array,
  cc: Uint8Array
): Uint8Array => {
  getWasm().ext_sr_derive_keypair_hard(8, ...allocU8a(pair), ...allocU8a(cc));
  return resultU8a();
};

export const sr25519DeriveKeypairSoft = (
  pair: Uint8Array,
  cc: Uint8Array
): Uint8Array => {
  getWasm().ext_sr_derive_keypair_soft(8, ...allocU8a(pair), ...allocU8a(cc));

  return resultU8a();
};
export const keyHdkdSr25519 = (
  keypair: Keypair,
  { chainCode, isSoft }: DeriveJunction
): Keypair =>
  isSoft
    ? createDeriveFn(sr25519DeriveKeypairSoft)(keypair, chainCode)
    : createDeriveFn(sr25519DeriveKeypairHard)(keypair, chainCode);

export const keyFromPathSr25519ASM = (pair, path) => {
  const keyHdkd = keyHdkdSr25519;
  let result = pair;
  // eslint-disable-next-line no-restricted-syntax
  for (const junction of path) {
    result = keyHdkd(result, junction);
  }

  return result;
};
