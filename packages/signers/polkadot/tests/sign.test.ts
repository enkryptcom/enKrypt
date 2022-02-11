import { expect } from 'chai';
import Signer from "../src"
import { SignerTypes } from "../src/types";

describe('Polkadot signers', () => { // the tests container
    it('ecdsa signer should work', async () => {
        const signer = new Signer(SignerTypes.ecdsa)
        const msgHash =
            "82ff40c0a986c6a5cfad4ddf4c3aa6996f1a7837f9c398e17e5de5cbd5a12b28";
        const privateKey =
            "3c9229289a6125f7fdf1885a77bb12c37a8d3b4962d936f7e3084dece32a3ca1";

        const signature = await signer.sign(msgHash, privateKey);
        expect(signature).equals("0x62e0289e8e569b137e51683edcf7c198e75ce2eec6cd5c878d5882bb73f9486b544cf6ac316006059a1cef68f288884de844de41c331bee802cdaa7c084299c601");
    });
    it('sr25519 signer should work', async () => {
        const signer = new Signer(SignerTypes.sr25519)
        const msgHash =
            "82ff40c0a986c6a5cfad4ddf4c3aa6996f1a7837f9c398e17e5de5cbd5a12b28";
        const privateKey =
            "3c9229289a6125f7fdf1885a77bb12c37a8d3b4962d936f7e3084dece32a3ca1";

        const signature = await signer.sign(msgHash, privateKey);
        expect(signature.length).equals(130);
    });
    it('ed25519 signer should work', async () => {
        const signer = new Signer(SignerTypes.ed25519)
        const msgHex =
            "61626364";
        const privateKeySeed =
            Buffer.from("12345678901234567890123456789012").toString("hex");

        const signature = await signer.sign(msgHex, privateKeySeed, { onlyJS: true });
        const validSig = "0x" + Buffer.from([28, 58, 206, 239, 249, 70, 59, 191, 166, 40, 219, 218, 235, 170, 25, 79, 10, 94, 9, 197, 34, 126, 1, 150, 246, 68, 28, 238, 36, 26, 172, 163, 168, 90, 202, 211, 126, 246, 57, 212, 43, 24, 88, 197, 240, 113, 118, 76, 37, 81, 91, 110, 236, 50, 144, 134, 100, 223, 220, 238, 34, 185, 211, 7]).toString("hex")
        expect(signature).equals(validSig);
    });
});