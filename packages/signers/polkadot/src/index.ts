import { SignerInterface, Errors } from "@enkryptcom/types"
import { bufferToHex, hexToBuffer } from "@enkryptcom/utils"
import { waitReady } from '@polkadot/wasm-crypto';
import { sr25519PairFromSeed, ed25519PairFromSeed, secp256k1PairFromSeed, ed25519Sign, secp256k1Sign, sr25519Sign, signatureVerify } from '@polkadot/util-crypto';

import { KeyPair, SignerTypes } from "./types";

class Signer implements SignerInterface {
    type: SignerTypes

    constructor(signer: SignerTypes) {
        this.type = signer
    }

    verify(msgHash: Buffer, sig: Buffer, publicKey: Buffer): boolean {
        const rpubkey = signatureVerify(msgHash, sig, publicKey)
        return rpubkey.isValid
    }

    async sign(msgHash: string, privateKey: string): Promise<string> {
        const msgHashBuffer = hexToBuffer(msgHash)
        const privateKeyBuffer = hexToBuffer(privateKey)
        let sig: Buffer
        let pair: KeyPair
        await waitReady()
        switch (this.type) {
            case SignerTypes.ecdsa:
                pair = secp256k1PairFromSeed(privateKeyBuffer)
                sig = Buffer.from(secp256k1Sign(msgHashBuffer, pair, 'blake2'))
                if (!this.verify(msgHashBuffer, sig, Buffer.from(pair.publicKey))) throw new Error(Errors.SigningErrors.UnableToVerify)
                return bufferToHex(sig);
            case SignerTypes.ed25519:
                pair = ed25519PairFromSeed(privateKeyBuffer)
                sig = Buffer.from(ed25519Sign(msgHashBuffer, pair))
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

// const signer = new Signer(SignerTypes.ecdsa)
// const privateKey =
//     "3c9229289a6125f7fdf1885a77bb12c37a8d3b4962d936f7e3084dece32a3ca1"

// const keypair = secp256k1PairFromSeed(Buffer.from(privateKey, "hex"))
// console.log("public key", Buffer.from(keypair.publicKey).toString("hex"), "private", Buffer.from(keypair.secretKey).toString("hex"))
// const msgHash =
//     "82ff40c0a986c6a5cfad4ddf4c3aa6996f1a7837f9c398e17e5de5cbd5a12b28";

// signer.sign(msgHash, privateKey).then(console.log)
