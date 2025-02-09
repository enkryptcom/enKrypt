import { EthEncryptedData } from "@enkryptcom/types";
import { box as naclBox, randomBytes } from "tweetnacl";
import {
  decodeBase64,
  encodeUTF8,
  decodeUTF8,
  encodeBase64,
} from "tweetnacl-util";
import { hexToBuffer, utf8ToHex } from ".";

const NACL_VERSION = "x25519-xsalsa20-poly1305";

const naclDecodeHex = (msgHex: string): Uint8Array =>
  decodeBase64(hexToBuffer(msgHex).toString("base64"));

const encryptedDataStringToJson = (strData: string): EthEncryptedData => {
  const buf = hexToBuffer(strData);
  return JSON.parse(buf.toString("utf8"));
};

const JsonToEncryptedDataString = (strData: EthEncryptedData): string => {
  const hex = utf8ToHex(JSON.stringify(strData));
  return hex;
};

const naclDecrypt = ({
  encryptedData,
  privateKey,
}: {
  encryptedData: EthEncryptedData;
  privateKey: string;
}): string => {
  switch (encryptedData.version) {
    case NACL_VERSION: {
      const recieverPrivateKeyUint8Array = naclDecodeHex(privateKey);
      const recieverEncryptionPrivateKey = naclBox.keyPair.fromSecretKey(
        recieverPrivateKeyUint8Array,
      ).secretKey;
      const nonce = decodeBase64(encryptedData.nonce);
      const ciphertext = decodeBase64(encryptedData.ciphertext);
      const ephemPublicKey = decodeBase64(encryptedData.ephemPublicKey);
      const decryptedMessage = naclBox.open(
        ciphertext,
        nonce,
        ephemPublicKey,
        recieverEncryptionPrivateKey,
      );
      let output;
      try {
        output = encodeUTF8(decryptedMessage);
        return output;
      } catch (err) {
        throw new Error("Decryption failed.");
      }
    }
    default:
      throw new Error("Encryption type/version not supported.");
  }
};

const naclEncrypt = ({
  publicKey,
  data,
  version,
}: {
  publicKey: string;
  data: unknown;
  version: string;
}): string => {
  if (!publicKey) {
    throw new Error("Missing publicKey parameter");
  } else if (!data) {
    throw new Error("Missing data parameter");
  } else if (!version) {
    throw new Error("Missing version parameter");
  }

  switch (version) {
    case NACL_VERSION: {
      if (typeof data !== "string") {
        throw new Error("Message data must be given as a string");
      }
      const ephemeralKeyPair = naclBox.keyPair();

      let pubKeyUInt8Array;
      try {
        pubKeyUInt8Array = decodeBase64(publicKey);
      } catch (err) {
        throw new Error("Bad public key");
      }
      const msgParamsUInt8Array = decodeUTF8(data);
      const nonce = randomBytes(24);
      const encryptedMessage = naclBox(
        msgParamsUInt8Array,
        nonce,
        pubKeyUInt8Array,
        ephemeralKeyPair.secretKey,
      );
      const output = {
        version: NACL_VERSION,
        nonce: encodeBase64(nonce),
        ephemPublicKey: encodeBase64(ephemeralKeyPair.publicKey),
        ciphertext: encodeBase64(encryptedMessage),
      };
      return JsonToEncryptedDataString(output);
    }

    default:
      throw new Error("Encryption type/version not supported.");
  }
};

export {
  naclDecodeHex,
  encryptedDataStringToJson,
  naclDecrypt,
  naclEncrypt,
  NACL_VERSION,
};
