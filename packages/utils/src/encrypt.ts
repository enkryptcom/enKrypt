import {
  randomBytes,
  createCipheriv,
  createDecipheriv,
  Cipher,
  Decipher,
} from "crypto";
import { scrypt } from "ethereum-cryptography/scrypt";
import { keccak256 } from "web3-utils";
import { EncryptedData, Errors } from "@enkryptcom/types";
import { bufferToHex, hexToBuffer } from ".";

const scryptParams = {
  cipher: "aes-128-ctr",
  kdf: "scrypt",
  dklen: 32,
  n: 262144,
  r: 8,
  p: 1,
};

const runCipherBuffer = (cipher: Cipher | Decipher, data: Buffer): Buffer =>
  Buffer.concat([cipher.update(data), cipher.final()]);

export const encrypt = async (
  msg: Buffer,
  password: string
): Promise<EncryptedData> => {
  const sparams = {
    ...{
      salt: randomBytes(32),
      iv: randomBytes(16),
    },
    ...scryptParams,
  };
  const derivedKey = await scrypt(
    Buffer.from(password),
    sparams.salt,
    sparams.n,
    sparams.p,
    sparams.r,
    sparams.dklen
  );
  const cipher = createCipheriv(
    sparams.cipher,
    derivedKey.slice(0, 16),
    sparams.iv
  );
  const ciphertext = runCipherBuffer(cipher, msg);
  const mac = keccak256(
    bufferToHex(
      Buffer.concat([
        Buffer.from(derivedKey.slice(16, 32)),
        Buffer.from(ciphertext),
      ])
    )
  );
  return {
    ciphertext: bufferToHex(ciphertext),
    salt: bufferToHex(sparams.salt),
    iv: bufferToHex(sparams.iv),
    version: 1,
    mac,
  };
};

export const decrypt = async (
  encryptedData: EncryptedData,
  password: string
): Promise<Buffer> => {
  const sparams = {
    ...{
      ciphertext: hexToBuffer(encryptedData.ciphertext),
      salt: hexToBuffer(encryptedData.salt),
      iv: hexToBuffer(encryptedData.iv),
      version: encryptedData.version,
      mac: encryptedData.mac,
    },
    ...scryptParams,
  };
  const derivedKey = await scrypt(
    Buffer.from(password),
    sparams.salt,
    sparams.n,
    sparams.p,
    sparams.r,
    sparams.dklen
  );
  const mac = keccak256(
    bufferToHex(
      Buffer.concat([Buffer.from(derivedKey.slice(16, 32)), sparams.ciphertext])
    )
  );
  if (mac !== sparams.mac) throw new Error(Errors.OtherErrors.WrongPassword);
  const decipher = createDecipheriv(
    sparams.cipher,
    derivedKey.slice(0, 16),
    sparams.iv
  );
  return runCipherBuffer(decipher, sparams.ciphertext);
};
