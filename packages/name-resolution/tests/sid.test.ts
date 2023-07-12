import { expect } from "chai";
import SIDResolver from "../src/sid";

describe("SID Name resolving", () => {
  // the tests container
  it("it should properly resolve address", async () => {
    const resolver = new SIDResolver({
      node: {
        bnb: "https://nodes.mewapi.io/rpc/bsc",
        arb: "https://nodes.mewapi.io/rpc/arb",
      },
    });
    await resolver.init();
    // let address = await resolver.resolveAddress("allen.bnb", "BNB");
    // expect(address).to.be.eq("0x2e552E3aD9f7446e9caB378c008315E0C26c0398");
    let address2 = await resolver.resolveAddress("spaceid.arb", "ARB1");
    expect(address2).to.be.eq("0xb5932a6B7d50A966AEC6C74C97385412Fb497540");
  }).timeout(10000);

  it("it should properly reverse resolve", async () => {
    const resolver = new SIDResolver({
      node: {
        bnb: "https://nodes.mewapi.io/rpc/bsc",
        arb: "https://nodes.mewapi.io/rpc/arb",
      },
    });
    await resolver.init();
    const name = await resolver.resolveReverseName(
      "0xb5932a6b7d50a966aec6c74c97385412fb497540"
    );
    expect(name).to.be.eq("spaceid.bnb");
  }).timeout(10000);

  it("it should return null if not found", async () => {
    const resolver = new SIDResolver({
      node: {
        bnb: "https://nodes.mewapi.io/rpc/bsc",
        arb: "https://nodes.mewapi.io/rpc/arbitrum",
      },
    });
    await resolver.init();
    const name = await resolver.resolveReverseName(
      "0xe5dc07bdcdb8c98850050c7f67de7e164b1ea392"
    );
    expect(name).to.be.eq(null);
    const address = await resolver.resolveAddress("sdfsfsdfsdfsdf.bnb", "BNB");
    expect(address).to.be.eq(null);
  }).timeout(10000);
});
