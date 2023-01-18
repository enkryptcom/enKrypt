import {
  stripHexPrefix,
  bytesToHex,
  hexToBytes,
  keccak256,
  utf8ToHex,
  numberToHex,
  isAddress,
} from "web3-utils";
import { bigIntToBuffer, bigIntToHex } from "@ethereumjs/util";
import { encodeAddress as polkadotEncodeAddress } from "@polkadot/util-crypto";
import { encrypt, decrypt } from "./encrypt";
import MemoryStorage from "./memory-storage";

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

/**
 * @description Implements EIP-1191 Address Checksum
 * @param {String} address
 * @param {String} chainId
 * @returns {String} checksummed address
 * @Reference: https://github.com/rsksmart/rsk-utils
 */
export const toChecksumAddress = (address: string, chainId: string): string => {
  const addressWithOutPrefix = stripHexPrefix(address).toLowerCase();
  const prefix = !isNaN(parseInt(chainId)) ? `${parseInt(chainId).toString()}0x` : "";
  const hash = keccak256(`${prefix}${addressWithOutPrefix}`).replace("0x", "");

  return (
    "0x" +
    addressWithOutPrefix
      .split("")
      .map((b, i) => (parseInt(hash[i], 16) >= 8 ? b.toUpperCase() : b))
      .join("")
  );
};

/**
 * @description Validates address checksum
 * @param {String} address
 * @param {Integer|String} chainId
 * @returns {Boolean}
 * @Reference: https://github.com/rsksmart/rsk-utils
 */
export const isValidChecksumAddress = (
  address: string,
  chainId: string
): boolean => {
  // For rootstock validate checksum using chainId
  if ([30, 31].includes(parseInt(chainId))) {
    // check if it has the basic requirements of an address
    if (!/^(0x)?[0-9a-f]{40}$/i.test(address)) {
      return false;
      // If it's ALL lowercase or ALL upppercase
    } else if (/^(0x|0X)?[0-9a-f]{40}$/.test(address) || /^(0x|0X)?[0-9A-F]{40}$/.test(address)) {
      return true;
      // Otherwise check mixed case
    } else {
      return (
        isValidAddressFormat(address) &&
        toChecksumAddress(address, chainId) === address
      );
    }
  }

  return isAddress(address);
};

const isValidAddressFormat = (address: string): boolean => {
  return /^(0x)?[0-9a-fA-F]{40}$/.test(address);
};

export {
  stripHexPrefix,
  utf8ToHex,
  bufferToHex,
  hexToBuffer,
  bytesToHex,
  hexToBytes,
  encrypt,
  decrypt,
  MemoryStorage,
  keccak256,
  polkadotEncodeAddress,
  numberToHex,
  bigIntToBuffer,
  bigIntToHex,
};
