import { expect } from "chai";
import NameResolver from "../src";

describe("Name Resolver resolving", () => {
  // the tests container
  it("it should properly resolve address", async () => {
    const resolver = new NameResolver({
      ens: {
        node: "https://nodes.mewapi.io/rpc/eth",
      },
    });
    let address = await resolver.resolveAddress("test.eth", "ETH");
    expect(address).to.be.eq("0xeefB13C7D42eFCc655E528dA6d6F7bBcf9A2251d");
    address = await resolver.resolveAddress("brad.crypto", "ETH");
    expect(address).to.be.eq("0x8aaD44321A86b170879d7A244c1e8d360c99DdA8");
  }).timeout(10000);

  it("it should properly reverse resolve", async () => {
    const resolver = new NameResolver({
      ens: {
        node: "https://nodes.mewapi.io/rpc/eth",
      },
    });
    const name = await resolver.resolveReverseName(
      "0xe5dc07bdcdb8c98850050c7f67de7e164b1ea391"
    );
    expect(name).to.be.eq("kvhnuke.eth");
  }).timeout(10000);
});
