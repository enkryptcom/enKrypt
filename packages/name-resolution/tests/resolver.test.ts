import { expect } from "chai";
import NameResolver from "../src";

describe("Name Resolver resolving", () => {
  // the tests container
  it("it should properly resolve address", async () => {
    const resolver = new NameResolver({
      ens: {
        node: "https://nodes.mewapi.io/rpc/eth",
      },
      sid: {
        node: {
          bnb: "https://nodes.mewapi.io/rpc/bsc",
          arb: "https://nodes.mewapi.io/rpc/arb",
        },
      },
    });
    let address = await resolver.resolveAddress("test.eth", "ETH");
    expect(address).to.be.eq("0xeefB13C7D42eFCc655E528dA6d6F7bBcf9A2251d");
    address = await resolver.resolveAddress("brad.crypto", "ETH");
    expect(address).to.be.eq("0x8aaD44321A86b170879d7A244c1e8d360c99DdA8");
    address = await resolver.resolveAddress("spaceid.arb", "ARB1");
    expect(address).to.be.eq("0xb5932a6B7d50A966AEC6C74C97385412Fb497540");
  }).timeout(20000);

  it("it should properly reverse resolve", async () => {
    const resolver = new NameResolver({
      ens: {
        node: "https://nodes.mewapi.io/rpc/eth",
      },
      sid: {
        node: {
          bnb: "https://nodes.mewapi.io/rpc/bsc",
          arb: "https://nodes.mewapi.io/rpc/arb",
        },
      },
    });
    let name = await resolver.resolveReverseName(
      "0xe5dc07bdcdb8c98850050c7f67de7e164b1ea391"
    );
    expect(name).to.be.eq("kvhnuke.eth");
    name = await resolver.resolveReverseName(
      "0xb5932a6b7d50a966aec6c74c97385412fb497540"
    );
    expect(name).to.be.eq("spaceid.eth");
  }).timeout(10000);
});
