import DataDecode from "../libs/transaction/data-decoder";
import { expect } from "chai";
import { BN } from "ethereumjs-util";
import { numberToHex } from "web3-utils";
describe("Test Ethereum data decoding", () => {
  it("should decode correct token transfer info", async () => {
    const dataDecoder = new DataDecode({
      data: "0xa9059cbb00000000000000000000000092eefc435008af9dfc428e9f84c2a6c0fd385e8f0000000000000000000000000000000000000000000000000000000017442ab1",
      value: "0x0",
    });
    expect(dataDecoder.functionSig).to.eq("0xa9059cbb");
    expect(dataDecoder.decode().decoded).to.eq(true);
    expect(dataDecoder.decode().isToken).to.eq(true);
    expect(dataDecoder.decode().values[0]).to.eq(
      "0x92eefc435008af9dfc428e9f84c2a6c0fd385e8f"
    );
    expect(dataDecoder.decode().values[1]).to.eq(
      numberToHex(new BN("390343345"))
    );
  });
  it("should not decode unknown data", async () => {
    const dataDecoder = new DataDecode({
      data: "0xa9058cbb0000000000",
      value: "0x0",
    });
    expect(dataDecoder.functionSig).to.eq("0xa9058cbb");
    expect(dataDecoder.decode().decoded).to.eq(false);
    expect(dataDecoder.decode().isToken).to.eq(false);
  });
});
