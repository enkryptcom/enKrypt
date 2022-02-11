import { SignerInterface, Errors } from "@enkryptcom/types"
import { bufferToHex, hexToBuffer } from "@enkryptcom/utils"
import { waitReady } from '@polkadot/wasm-crypto';
import { sr25519PairFromSeed, ed25519PairFromSeed, secp256k1PairFromSeed, ed25519Sign, secp256k1Sign, sr25519Sign, signatureVerify } from '@polkadot/util-crypto';

import { KeyPair, SignerTypes, SignOptions } from "./types";

class Signer implements SignerInterface {
    type: SignerTypes

    constructor(signer: SignerTypes) {
        this.type = signer
    }

    verify(msgHash: Buffer, sig: Buffer, publicKey: Buffer): boolean {
        const rpubkey = signatureVerify(msgHash, sig, publicKey)
        return rpubkey.isValid
    }

    async sign(msgHash: string, privateKey: string, options: SignOptions = { onlyJS: false }): Promise<string> {
        const msgHashBuffer = hexToBuffer(msgHash)
        const privateKeyBuffer = hexToBuffer(privateKey)
        let sig: Buffer
        let pair: KeyPair
        await waitReady()
        switch (this.type) {
            case SignerTypes.ecdsa:
                pair = secp256k1PairFromSeed(privateKeyBuffer, options.onlyJS)
                sig = Buffer.from(secp256k1Sign(msgHashBuffer, pair, 'blake2', options.onlyJS))
                if (!this.verify(msgHashBuffer, sig, Buffer.from(pair.publicKey))) throw new Error(Errors.SigningErrors.UnableToVerify)
                return bufferToHex(sig);
            case SignerTypes.ed25519:
                pair = ed25519PairFromSeed(privateKeyBuffer, options.onlyJS)
                sig = Buffer.from(ed25519Sign(msgHashBuffer, pair, options.onlyJS))
                if (!this.verify(msgHashBuffer, sig, Buffer.from(pair.publicKey))) throw new Error(Errors.SigningErrors.UnableToVerify)
                return bufferToHex(sig);
            case SignerTypes.sr25519:
                pair = sr25519PairFromSeed(privateKeyBuffer)
                sig = Buffer.from(sr25519Sign(msgHashBuffer, pair))
                if (!this.verify(msgHashBuffer, sig, Buffer.from(pair.publicKey))) throw new Error(Errors.SigningErrors.UnableToVerify)
                return bufferToHex(sig);
            default:
                throw new Error(Errors.SigningErrors.NotSupported)
        }
    };
}
export default Signer