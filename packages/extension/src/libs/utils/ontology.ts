import { encode, decode } from "bs58";
import { sha256 } from "ethereumjs-util";

const ADDR_VERSION = "17";

const ab2hexstring = (arr: Uint8Array) => {
  let result = "";
  const uint8Arr = new Uint8Array(arr);
  for (let i = 0; i < uint8Arr.byteLength; i++) {
    let str = uint8Arr[i].toString(16);
    str = str.length === 0 ? "00" : str.length === 1 ? "0" + str : str;
    result += str;
  }
  return result;
};

const hexToBase58 = (hexEncoded: string) => {
  hexEncoded = hexEncoded.replace("0x", "");
  const data = ADDR_VERSION + hexEncoded;
  const hash = sha256(sha256(Buffer.from(data, "hex"))).toString("hex");
  const checksum = hash.slice(0, 8);
  const datas = data + checksum;
  return encode(Buffer.from(datas, "hex"));
};

const base58ToHex = (base58Encoded: string) => {
  const decoded = decode(base58Encoded);
  const hexEncoded = ab2hexstring(decoded).substring(2, 42);
  if (base58Encoded !== hexToBase58(hexEncoded)) {
    throw new Error("[addressToU160] decode encoded verify failed");
  }
  return hexEncoded;
};

export { hexToBase58, base58ToHex };
