import {
  privateToPublic,
  ecsign,
  ecrecover,
  fromRpcSig,
  toRpcSig,
  privateToAddress,
  importPublic,
} from "@ethereumjs/util";
import { mnemonicToSeed } from "bip39";
import {
  Errors,
  SignerInterface,
  KeyPair,
  MnemonicWithExtraWord,
} from "@enkryptcom/types";
import {
  hexToBuffer,
  bufferToHex,
  encryptedDataStringToJson,
  naclDecodeHex,
  naclDecrypt,
} from "@enkryptcom/utils";
import HDkey from "hdkey";
import { box as naclBox } from "tweetnacl";
import { encodeBase64 } from "tweetnacl-util";

// `ecrecover` returns the 64 byte ethereum public key. Key pairs held by the
// keyring may carry the SEC1 compressed (33 byte) or uncompressed (65 byte)
// form instead, so bring both sides to the same representation before
// comparing them.
const toEthereumPublicKey = (publicKey: string): string => {
  const keyBuffer = hexToBuffer(publicKey);
  if (keyBuffer.length === 64) return bufferToHex(keyBuffer);
  try {
    return bufferToHex(importPublic(keyBuffer));
  } catch {
    return bufferToHex(keyBuffer);
  }
};

export class EthereumSigner implements SignerInterface {
  async generate(
    mnemonic: MnemonicWithExtraWord,
    derivationPath = "",
  ): Promise<KeyPair> {
    const seed = await mnemonicToSeed(mnemonic.mnemonic, mnemonic.extraWord);
    const hdkey = HDkey.fromMasterSeed(seed);
    const key = hdkey.derive(derivationPath);
    return {
      address: bufferToHex(privateToAddress(key.privateKey)),
      privateKey: bufferToHex(key.privateKey),
      publicKey: bufferToHex(privateToPublic(key.privateKey)),
    };
  }

  async verify(
    msgHash: string,
    sig: string,
    publicKey: string,
  ): Promise<boolean> {
    const sigdecoded = fromRpcSig(sig as `0x${string}`);
    const rpubkey = ecrecover(
      hexToBuffer(msgHash),
      sigdecoded.v,
      sigdecoded.r,
      sigdecoded.s,
    );
    return bufferToHex(rpubkey) === toEthereumPublicKey(publicKey);
  }

  async sign(msgHash: string, keyPair: KeyPair): Promise<string> {
    const msgHashBuffer = hexToBuffer(msgHash);
    const privateKeyBuffer = hexToBuffer(keyPair.privateKey);
    const signature = ecsign(msgHashBuffer, privateKeyBuffer);
    const rpcSig = toRpcSig(signature.v, signature.r, signature.s);
    const isValid = await this.verify(
      bufferToHex(msgHashBuffer),
      rpcSig,
      keyPair.publicKey,
    );
    if (!isValid) {
      throw new Error(Errors.SigningErrors.UnableToVerify);
    }
    return toRpcSig(signature.v, signature.r, signature.s);
  }

  async getEncryptionPublicKey(keyPair: KeyPair): Promise<string> {
    const privateKeyUint8Array = naclDecodeHex(keyPair.privateKey);
    const encryptionPublicKey =
      naclBox.keyPair.fromSecretKey(privateKeyUint8Array).publicKey;
    return encodeBase64(encryptionPublicKey);
  }

  async decrypt(encryptedDataStr: string, keyPair: KeyPair): Promise<string> {
    const encryptedData = encryptedDataStringToJson(encryptedDataStr);
    return naclDecrypt({ encryptedData, privateKey: keyPair.privateKey });
  }
}
