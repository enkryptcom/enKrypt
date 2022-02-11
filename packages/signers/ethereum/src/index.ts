import { ecsign, ecrecover, privateToPublic, ECDSASignature, toRpcSig } from "ethereumjs-util"
import { Errors, SignerInterface } from "@enkryptcom/types"
import { hexToBuffer } from "@enkryptcom/utils"

class Signer implements SignerInterface {

    verify(msgHash: Buffer, sig: ECDSASignature, publicKey: Buffer): boolean {
        const rpubkey = ecrecover(msgHash, sig.v, sig.r, sig.s)
        return rpubkey.toString("hex") === publicKey.toString("hex")
    }

    async sign(msgHash: string, privateKey: string): Promise<string> {
        const msgHashBuffer = hexToBuffer(msgHash)
        const privateKeyBuffer = hexToBuffer(privateKey)
        const signature = ecsign(msgHashBuffer, privateKeyBuffer)
        if (!this.verify(msgHashBuffer, signature, privateToPublic(privateKeyBuffer))) {
            throw new Error(Errors.SigningErrors.UnableToVerify)
        }
        return toRpcSig(signature.v, signature.r, signature.s)
    }
}
export default Signer