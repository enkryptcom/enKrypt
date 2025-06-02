import { describe, it, expect } from "vitest";
import SIDResolver from "../src/sid";

describe("SID Name resolving", () => {
  // the tests container
  it("it should properly resolve address", { timeout: 10_000 }, async () => {
    const resolver = new SIDResolver({
      node: {
        bnb: "https://nodes.mewapi.io/rpc/bsc",
        arb: "https://nodes.mewapi.io/rpc/arb",
      },
    });
    await resolver.init();
    const address = await resolver.resolveAddress("spaceid.arb", "ethereum");
    expect(address).to.be.eq("0xb5932a6B7d50A966AEC6C74C97385412Fb497540");
  });

  it("it should properly reverse resolve", { timeout: 10_000 }, async () => {
    const resolver = new SIDResolver({
      node: {
        bnb: "https://nodes.mewapi.io/rpc/bsc",
        arb: "https://nodes.mewapi.io/rpc/arb",
      },
    });
    await resolver.init();
    const name = await resolver.resolveReverseName(
      "0x1e3157ead0f498d814495d228f6ea4f041a3dc40",
    );
    expect(name).to.be.eq("melissaa.bnb");
  });

  it("it should return null if not found", { timeout: 10_000 }, async () => {
    const resolver = new SIDResolver({
      node: {
        bnb: "https://nodes.mewapi.io/rpc/bsc",
        arb: "https://nodes.mewapi.io/rpc/arbitrum",
      },
    });
    await resolver.init();
    const name = await resolver.resolveReverseName(
      "0xe5dc07bdcdb8c98850050c7f67de7e164b1ea392",
    );
    expect(name).to.be.eq(null);
    const address = await resolver.resolveAddress(
      "sdfsfsdfsdfsdf.bnb",
      "ethereum",
    );
    expect(address).to.be.eq(null);
  });
});
