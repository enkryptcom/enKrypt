import { expect } from "chai";
import { stripHexPrefix, bufferToHex, hexToBuffer } from "../src";

describe("Utility functions", () => {
  it("stripping 0x from string", () => {
    expect(stripHexPrefix("0xabcdef123456789")).equals("abcdef123456789");
  });
  it("Buffer to Hex", () => {
    const buf = Buffer.from("123456", "hex");
    expect(bufferToHex(buf)).equals("0x123456");
    expect(bufferToHex(buf, true)).equals("123456");
  });
  it("Hex to buffer", () => {
    const buf = Buffer.from("123456", "hex");
    expect(hexToBuffer("0x123456")).to.be.deep.equal(buf);
    expect(hexToBuffer("123456")).to.be.deep.equal(buf);
  });
});
