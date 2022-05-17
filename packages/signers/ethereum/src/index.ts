import {
  ecsign,
  ecrecover,
  fromRpcSig,
  toRpcSig,
  privateToPublic,
  privateToAddress,
} from "ethereumjs-util";
import { mnemonicToSeed } from "bip39";
import { Errors, SignerInterface, KeyPair } from "@enkryptcom/types";
import { hexToBuffer, bufferToHex } from "@enkryptcom/utils";
import HDkey from "hdkey";
import { box as naclBox } from "tweetnacl";
import { encodeBase64 } from "tweetnacl-util";
import { encryptedDataStringToJson, naclDecodeHex, naclDecrypt } from "./utils";

class Signer implements SignerInterface {
  async generate(mnemonic: string, derivationPath = ""): Promise<KeyPair> {
    const seed = await mnemonicToSeed(mnemonic);
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
    publicKey: string
  ): Promise<boolean> {
    const sigdecoded = fromRpcSig(sig);
    const rpubkey = ecrecover(
      hexToBuffer(msgHash),
      sigdecoded.v,
      sigdecoded.r,
      sigdecoded.s
    );
    return bufferToHex(rpubkey) === publicKey;
  }

  async sign(msgHash: string, keyPair: KeyPair): Promise<string> {
    const msgHashBuffer = hexToBuffer(msgHash);
    const privateKeyBuffer = hexToBuffer(keyPair.privateKey);
    const signature = ecsign(msgHashBuffer, privateKeyBuffer);
    const rpcSig = toRpcSig(signature.v, signature.r, signature.s);
    if (!this.verify(bufferToHex(msgHashBuffer), rpcSig, keyPair.publicKey)) {
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
export default Signer;
