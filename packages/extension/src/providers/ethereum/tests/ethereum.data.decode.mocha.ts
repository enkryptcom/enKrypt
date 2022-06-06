import DataDecode from "../libs/transaction/data-decoder";
import { simpleEncode } from "ethereumjs-abi";
import { expect } from "chai";
import { BN } from "ethereumjs-util";
describe("Test Ethereum data decoding", () => {
  it("should decode correct token transfer info", async () => {
    const dataDecoder = new DataDecode(
      "0xa9059cbb00000000000000000000000092eefc435008af9dfc428e9f84c2a6c0fd385e8f0000000000000000000000000000000000000000000000000000000017442ab1"
    );
    expect(dataDecoder.functionSig).to.eq("0xa9059cbb");
    expect(dataDecoder.decode().decoded).to.eq(true);
    expect(dataDecoder.decode().isToken).to.eq(true);
    expect(dataDecoder.decode().values[0].toString("hex")).to.eq(
      "92eefc435008af9dfc428e9f84c2a6c0fd385e8f"
    );
    expect(dataDecoder.decode().values[1].toString()).to.eq(
      new BN("390343345").toString()
    );
  });
});
