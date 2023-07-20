/* eslint-disable class-methods-use-this */
import {
  SignerInterface,
  Errors,
  SignerType,
  KeyPair as KRKeyPair,
} from "@enkryptcom/types";
import { bufferToHex, hexToBuffer } from "@enkryptcom/utils";
import { waitReady } from "@polkadot/wasm-crypto";
import {
  sr25519PairFromSeed,
  ed25519PairFromSeed,
  secp256k1PairFromSeed,
  ed25519Sign,
  secp256k1Sign,
  sr25519Sign,
  signatureVerify,
  keyExtractSuri,
  keyFromPath,
  mnemonicToMiniSecret,
  encodeAddress,
  blake2AsU8a,
} from "@polkadot/util-crypto";
import assert from "assert";
import { KeyPair, SignOptions } from "./types";

const SUBSTRATE_PREFIX = 42;

class Signer implements SignerInterface {
  type: SignerType;

  constructor(signer: SignerType) {
    this.type = signer;
  }

  async generate(
    mnemonic: string,
    derivationPath = "",
    options: SignOptions = { onlyJS: false }
  ): Promise<KRKeyPair> {
    await waitReady();
    const { path, phrase, password } = keyExtractSuri(
      `${mnemonic}${derivationPath}`
    );
    const seed = mnemonicToMiniSecret(
      phrase,
      password,
      undefined,
      options.onlyJS
    );
    let pair: KeyPair;
    switch (this.type) {
      case SignerType.ecdsa:
        pair = keyFromPath(
          secp256k1PairFromSeed(seed, options.onlyJS),
          path,
          "ecdsa"
        );
        break;
      case SignerType.ed25519:
        pair = keyFromPath(
          ed25519PairFromSeed(seed, options.onlyJS),
          path,
          "ed25519"
        );
        break;
      case SignerType.sr25519:
        pair = keyFromPath(sr25519PairFromSeed(seed), path, "sr25519");
        break;
      default:
        throw new Error(Errors.SigningErrors.NotSupported);
    }
    return {
      address:
        this.type === SignerType.ecdsa
          ? encodeAddress(blake2AsU8a(pair.publicKey), SUBSTRATE_PREFIX)
          : encodeAddress(pair.publicKey, SUBSTRATE_PREFIX),
      privateKey: bufferToHex(pair.secretKey),
      publicKey: bufferToHex(pair.publicKey),
    };
  }

  async verify(
    msgHash: string,
    sig: string,
    publicKey: string
  ): Promise<boolean> {
    await waitReady();
    const rpubkey = signatureVerify(msgHash, sig, publicKey);
    return rpubkey.isValid;
  }

  async sign(
    msgHash: string,
    keyPair: KRKeyPair,
    options: SignOptions = { onlyJS: false }
  ): Promise<string> {
    const msgHashBuffer = hexToBuffer(msgHash);
    let sig: Buffer;
    const pair: KeyPair = {
      secretKey: hexToBuffer(keyPair.privateKey),
      publicKey: hexToBuffer(keyPair.publicKey),
    };
    await waitReady();
    switch (this.type) {
      case SignerType.ecdsa:
        sig = Buffer.from(
          secp256k1Sign(msgHashBuffer, pair, "blake2", options.onlyJS)
        );
        assert(
          this.verify(
            bufferToHex(msgHashBuffer),
            bufferToHex(sig),
            bufferToHex(pair.publicKey)
          ),
          Errors.SigningErrors.UnableToVerify
        );
        return bufferToHex(sig);
      case SignerType.ed25519:
        sig = Buffer.from(ed25519Sign(msgHashBuffer, pair, options.onlyJS));
        assert(
          this.verify(
            bufferToHex(msgHashBuffer),
            bufferToHex(sig),
            bufferToHex(pair.publicKey)
          ),
          Errors.SigningErrors.UnableToVerify
        );
        return bufferToHex(sig);
      case SignerType.sr25519:
        sig = Buffer.from(sr25519Sign(msgHashBuffer, pair));
        assert(
          this.verify(
            bufferToHex(msgHashBuffer),
            bufferToHex(sig),
            bufferToHex(pair.publicKey)
          ),
          Errors.SigningErrors.UnableToVerify
        );
        return bufferToHex(sig);
      default:
        throw new Error(Errors.SigningErrors.NotSupported);
    }
  }
}
export { SignerType };
export default Signer;
