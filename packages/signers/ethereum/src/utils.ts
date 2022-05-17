import { EthEncryptedData } from "@enkryptcom/types";
import { hexToBuffer } from "@enkryptcom/utils";
import { decodeBase64, encodeUTF8 } from "tweetnacl-util";
import { box as naclBox } from "tweetnacl";

const naclDecodeHex = (msgHex: string): Uint8Array =>
  decodeBase64(hexToBuffer(msgHex).toString("base64"));

const encryptedDataStringToJson = (strData: string): EthEncryptedData => {
  const buf = hexToBuffer(strData);
  return JSON.parse(buf.toString("utf8"));
};
const naclDecrypt = ({
  encryptedData,
  privateKey,
}: {
  encryptedData: EthEncryptedData;
  privateKey: string;
}): string => {
  switch (encryptedData.version) {
    case "x25519-xsalsa20-poly1305": {
      const recieverPrivateKeyUint8Array = naclDecodeHex(privateKey);
      const recieverEncryptionPrivateKey = naclBox.keyPair.fromSecretKey(
        recieverPrivateKeyUint8Array
      ).secretKey;
      const nonce = decodeBase64(encryptedData.nonce);
      const ciphertext = decodeBase64(encryptedData.ciphertext);
      const ephemPublicKey = decodeBase64(encryptedData.ephemPublicKey);
      const decryptedMessage = naclBox.open(
        ciphertext,
        nonce,
        ephemPublicKey,
        recieverEncryptionPrivateKey
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
export { naclDecodeHex, encryptedDataStringToJson, naclDecrypt };
