import { expect } from "chai";
import RNSResolver from "../src/rns";

describe("RNS Name resolving", () => {
  // the tests container
  it("it should properly resolve address", async () => {
    const resolver = new RNSResolver();
    await resolver.init();
    const address = await resolver.resolveAddress("riverplate.rsk", "RSK");
    expect(address).to.be.eq("0x9d4969d06411d3b319f7204b71000cf874165bb0");
  }).timeout(10000);

  it("it should properly reverse resolve", async () => {
    const resolver = new RNSResolver();
    await resolver.init();
    const name = await resolver.resolveReverseName(
      "0xA78C937844b27Bec024f042DCbe5b85D2B7344F6"
      );
      expect(name).to.be.eq("alepc.rsk");
    }).timeout(10000);

  it("it should return null if not found", async () => {
    const resolver = new RNSResolver();
    await resolver.init();
    const name = await resolver.resolveReverseName(
      "0xdEd8d71685A34B682681E2808e504af3cec246a0"
    );
    expect(name).to.be.eq(null);
  }).timeout(10000);
});
