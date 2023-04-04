import { expect } from "chai";
import { toBN } from "web3-utils";
import { fromToken } from "./fixtures/mainnet/configs";
import SwapToken from "../src/swapToken";

describe("SwapToken", () => {
  it("it should convert", async () => {
    const token = new SwapToken(fromToken);
    expect(token.toRaw("1526.652").toString()).to.be.eq(
      "1526652000000000000000"
    );
    expect(
      token.toReadable(toBN("1526652000000000000000")).toString()
    ).to.be.eq("1526.652");
  });
});
