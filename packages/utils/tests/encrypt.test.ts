import { expect } from "chai";
import { randomBytes } from "crypto";
import { encrypt, decrypt, bufferToHex } from "../src";

describe("Encrypt Decrypt Functions", () => {
  it("should properly encrypt and decrypt", async () => {
    const buf = randomBytes(2048);
    const password = randomBytes(1024).toString("hex");
    const encryptedData = await encrypt(buf, password);
    const decryptedBuf = await decrypt(encryptedData, password);
    expect(bufferToHex(decryptedBuf)).equals(bufferToHex(decryptedBuf));
  }).timeout(20000);
});
