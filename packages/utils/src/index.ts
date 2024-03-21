import { hexToBytes, keccak256, utf8ToHex, numberToHex } from "web3-utils";
import { bigIntToBytes, bigIntToHex } from "@ethereumjs/util";
import { encodeAddress as polkadotEncodeAddress } from "@polkadot/util-crypto";
import { encrypt, decrypt } from "./encrypt";
import MemoryStorage from "./memory-storage";
import { fromBase, toBase, isValidDecimals } from "./units";
import { toBN, stripHexPrefix } from "./number-to-bn";

const bufferToHex = (buf: Buffer | Uint8Array, nozerox = false): string =>
  nozerox
    ? Buffer.from(buf).toString("hex")
    : `0x${Buffer.from(buf).toString("hex")}`;

const hexToBuffer = (hex: string): Buffer =>
  Buffer.from(
    stripHexPrefix(hex).length % 2 === 1
      ? `0${stripHexPrefix(hex)}`
      : stripHexPrefix(hex),
    "hex"
  );

export {
  toBN,
  stripHexPrefix,
  utf8ToHex,
  bufferToHex,
  hexToBuffer,
  hexToBytes,
  encrypt,
  decrypt,
  MemoryStorage,
  keccak256,
  polkadotEncodeAddress,
  numberToHex,
  bigIntToBytes,
  bigIntToHex,
  fromBase,
  toBase,
  isValidDecimals,
};
