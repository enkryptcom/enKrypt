/* This module contains cryptographic functions federating between Node.js and the browser.
 * @packageDocumentation
 *
 * @privateRemarks
 * If you extend this module, please check that the functions are working in both Node.js and the browser.
 */

const KEY_SIZE_BYTES = 32;
const IV_SIZE_BYTES = 12;
const AUTH_TAG_SIZE_BYTES = 16;

const U8_SIZE_BITS = 8;

function isNode(): boolean {
  // inspired from secure-random.js
  // we check for process.pid to prevent browserify from tricking us
  return (
    typeof process !== "undefined" &&
    typeof process.pid === "number" &&
    typeof process.versions?.node === "string"
  );
}

async function pbkdf2Node(
  password: string,
  salt: Buffer,
  opts: PBKDF2Options,
): Promise<Uint8Array> {
  const { iterations, keyLength, hash } = opts;
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const crypto = require("crypto");
  return new Promise((resolve, reject) => {
    crypto.pbkdf2(
      password,
      salt,
      iterations,
      keyLength,
      hash,
      (err, derivedKey) => {
        if (err) reject(err);
        else resolve(derivedKey);
      },
    );
  });
}

async function pbkdf2Browser(
  password: string,
  salt: Buffer,
  opts: PBKDF2Options,
): Promise<Uint8Array> {
  const { iterations, keyLength, hash } = opts;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const crypto = window.crypto || (window as any).msCrypto;

  if (!crypto) throw new Error("Your browser does not expose window.crypto.");

  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(password),
    { name: "PBKDF2" },
    false,
    ["deriveBits", "deriveKey"],
  );
  const derivedKey = await crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt: salt,
      iterations: iterations,
      hash: { name: hash },
    },
    keyMaterial,
    { name: "AES-GCM", length: keyLength * U8_SIZE_BITS },
    false,
    ["encrypt", "decrypt"],
  );

  const exportedKey = await crypto.subtle.exportKey("raw", derivedKey);
  const buffer = Buffer.from(exportedKey);

  return buffer;
}

export type PBKDF2Options = {
  iterations: number;
  keyLength: number;
  hash: string;
};

/**
 * Derives a cryptographic key using PBKDF2.
 *
 * @param password - The password from which to derive the key.
 * @param salt - The cryptographic salt.
 * @param opts - Options for the derivation.
 *
 * @returns  The derived key.
 */
export async function pbkdf2(
  password: string,
  salt: Buffer,
  opts: PBKDF2Options,
): Promise<Uint8Array> {
  if (isNode()) {
    return pbkdf2Node(password, salt, opts);
  }

  return pbkdf2Browser(password, salt, opts);
}

/**
 * Seals data using AES-256-GCM encryption.
 *
 * @param data - The data to encrypt.
 * @param key - The 32-byte secret key.
 * @param iv - The 12-byte initialization vector.
 *
 * @throws If the key is not 32 bytes.
 * @throws If the iv is not 12 bytes.
 *
 * @returns The encrypted data.
 */
export async function aesGCMEncrypt(
  data: Uint8Array,
  key: Uint8Array,
  iv: Uint8Array,
): Promise<Uint8Array> {
  if (key.length !== KEY_SIZE_BYTES) {
    throw new Error(`key must be ${KEY_SIZE_BYTES} bytes`);
  }
  if (iv.length !== IV_SIZE_BYTES) {
    throw new Error(`iv must be ${IV_SIZE_BYTES} bytes`);
  }
  if (isNode()) {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const crypto = require("crypto");
    const cipher = crypto.createCipheriv("aes-256-gcm", key, iv);
    const encrypted = Buffer.concat([
      cipher.update(data),
      cipher.final(),
      cipher.getAuthTag(),
    ]);
    return encrypted;
  }

  const keyData = await window.crypto.subtle.importKey(
    "raw",
    key,
    { name: "AES-GCM" },
    false,
    ["encrypt"],
  );
  const encrypted = await window.crypto.subtle.encrypt(
    { name: "AES-GCM", iv: iv },
    keyData,
    data,
  );
  return Buffer.from(encrypted);
}

/**
 * Unseals data using AES-256-GCM decryption.
 *
 * @remarks
 * The authentication tag shall be appended to the encryptedData.
 *
 * @param encryptedData - The data to decrypt.
 * @param key - The 32-byte secret key.
 * @param iv - The 12-byte initialization vector.
 *
 * @throws If the key is not 32 bytes.
 * @throws If the iv is not 12 bytes.
 *
 * @returns The decrypted data.
 */
export async function aesGCMDecrypt(
  encryptedData: Uint8Array,
  key: Uint8Array,
  iv: Uint8Array,
): Promise<Uint8Array> {
  if (key.length !== KEY_SIZE_BYTES) {
    throw new Error(`key must be ${KEY_SIZE_BYTES} bytes`);
  }
  if (iv.length !== IV_SIZE_BYTES) {
    throw new Error(`iv must be ${IV_SIZE_BYTES} bytes`);
  }
  if (isNode()) {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const crypto = require("crypto");
    encryptedData = Buffer.from(encryptedData);
    const decipher = crypto.createDecipheriv("aes-256-gcm", key, iv);
    decipher.setAuthTag(
      encryptedData.slice(encryptedData.length - AUTH_TAG_SIZE_BYTES),
    );
    const decrypted = Buffer.concat([
      decipher.update(
        encryptedData.slice(0, encryptedData.length - AUTH_TAG_SIZE_BYTES),
      ),
      decipher.final(),
    ]);
    return decrypted;
  }

  const keyData = await window.crypto.subtle.importKey(
    "raw",
    key,
    { name: "AES-GCM" },
    false,
    ["decrypt"],
  );
  const decrypted = await window.crypto.subtle.decrypt(
    { name: "AES-GCM", iv: iv },
    keyData,
    encryptedData,
  );
  return Buffer.from(decrypted);
}
