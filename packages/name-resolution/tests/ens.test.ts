import { expect } from "chai";
import ENSResolver from "../src/ens";

describe("ENS Name resolving", () => {
  // the tests container
  it("it should properly resolve address", async () => {
    const resolver = new ENSResolver({
      node: "https://nodes.mewapi.io/rpc/eth",
    });
    await resolver.init();
    let address = await resolver.resolveAddress("test.eth", "ETH");
    expect(address).to.be.eq("0xeefB13C7D42eFCc655E528dA6d6F7bBcf9A2251d");
    address = await resolver.resolveAddress("1.offchainexample.eth", "ETH");
    expect(address).to.be.eq("0x41563129cDbbD0c5D3e1c86cf9563926b243834d");
  }).timeout(20000);

  it("it should properly reverse resolve", async () => {
    const resolver = new ENSResolver({
      node: "https://nodes.mewapi.io/rpc/eth",
    });
    await resolver.init();
    const name = await resolver.resolveReverseName(
      "0xe5dc07bdcdb8c98850050c7f67de7e164b1ea391"
    );
    expect(name).to.be.eq("kvhnuke.eth");
  }).timeout(10000);

  it("it should return null if not found", async () => {
    const resolver = new ENSResolver({
      node: "https://nodes.mewapi.io/rpc/eth",
    });
    await resolver.init();
    const name = await resolver.resolveReverseName(
      "0xe5dc07bdcdb8c98850050c7f67de7e164b1ea392"
    );
    expect(name).to.be.eq(null);
    const address = await resolver.resolveAddress("sdfsfsdfsdfsdf.eth", "ETH");
    expect(address).to.be.eq(null);
  }).timeout(10000);
});
