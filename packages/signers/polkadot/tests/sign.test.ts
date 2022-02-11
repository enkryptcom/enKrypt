import { expect } from 'chai';
import Signer from "../src"
import { SignerTypes } from "../src/types";

describe('Polkadot signers', () => { // the tests container
    it('ecdsa signer should work', async () => {
        const ecdsaSigner = new Signer(SignerTypes.ecdsa)
        const msgHash =
            "82ff40c0a986c6a5cfad4ddf4c3aa6996f1a7837f9c398e17e5de5cbd5a12b28";
        const privateKey =
            "3c9229289a6125f7fdf1885a77bb12c37a8d3b4962d936f7e3084dece32a3ca1";

        const signature = await ecdsaSigner.sign(msgHash, privateKey);
        expect(signature).equals("0x62e0289e8e569b137e51683edcf7c198e75ce2eec6cd5c878d5882bb73f9486b544cf6ac316006059a1cef68f288884de844de41c331bee802cdaa7c084299c601");
    });
});