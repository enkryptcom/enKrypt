import { expect } from "chai";
import SNSResolver from "../src/sns"

describe("SNS Name resolving", () => {
  // the tests container
  it("it should properly resolve address", async () => {
    const resolver = new SNSResolver({ network: "testnet" });
    await resolver.init();
    const address = await resolver.resolveAddress("mock3.sol", "BNB");
    expect(address).to.be.eq("0x1D719d2dB763f905b1924F46a5185e001Dd93786");
  }).timeout(10000);

  it("it should return null if not found", async () => {
    const resolver = new SNSResolver({ network: "testnet" });
    await resolver.init();
    const name = await resolver.resolveReverseName(
      "0xe5dc07bdcdb8c98850050c7f67de7e164b1ea392"
    );
    expect(name).to.be.eq(null);
    const address = await resolver.resolveAddress(
      "sdfsfsdfsdfsdf.sol",
      "BASE"
    );
    expect(address).to.be.eq(null);
  }).timeout(10000);
});
