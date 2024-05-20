import { expect } from "chai";
import {
  stripHexPrefix,
  bufferToHex,
  hexToBuffer,
  toBase,
  fromBase,
  toBN,
} from "../src";

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
  it("toBN to string", () => {
    let bn = toBN("0xabcdef");
    expect(bn.toString()).to.be.equal("11259375");
    bn = toBN("0");
    expect(bn.toString()).to.be.equal("0");
  });
  it("To Base/From Base", () => {
    expect(toBase("1193046", 18)).to.be.equal("1193046000000000000000000");
    expect(fromBase("1193046000000000000000000", 18)).to.be.equal("1193046");
  });
});
