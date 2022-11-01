import { expect } from "chai";
import UDResolver from "../src/ud";

describe("UD Name resolving", () => {
  // the tests container
  it("it should properly resolve address", async () => {
    const resolver = new UDResolver();
    await resolver.init();
    let address = await resolver.resolveAddress("brad.crypto", "ETH");
    expect(address).to.be.eq("0x8aaD44321A86b170879d7A244c1e8d360c99DdA8");
    address = await resolver.resolveAddress("brad.zil", "ETH");
    expect(address).to.be.eq("0x45b31e01AA6f42F0549aD482BE81635ED3149abb");
  }).timeout(10000);

  //   it("it should properly reverse resolve", async () => {
  //     const resolver = new UDResolver();
  //     await resolver.init();
  //     const name = await resolver.resolveReverseName(
  //       "0xe5dc07bdcdb8c98850050c7f67de7e164b1ea391"
  //     );
  //     expect(name).to.be.eq("kvhnuke.eth");
  //   }).timeout(10000);

  it("it should return null if not found", async () => {
    const resolver = new UDResolver();
    await resolver.init();
    const name = await resolver.resolveReverseName(
      "0xe5dc07bdcdb8c98850050c7f67de7e164b1ea392"
    );
    expect(name).to.be.eq(null);
    const address = await resolver.resolveAddress(
      "sdfsfsdfsdfsdf.crypto",
      "ETH"
    );
    expect(address).to.be.eq(null);
  }).timeout(10000);
});
