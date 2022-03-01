import { expect } from "chai";
import Request from "../src";

describe("Websocket RPC calls", () => {
  const wsRequest = Request("wss://nodes.mewapi.io/ws/eth", [], {
    headers: { "User-Agent": " Mozilla/5.0" },
  });
  it("it should properly respond", async () => {
    const chainId = await wsRequest.request({ method: "eth_chainId" });
    expect(chainId).to.equal("0x1");
    await wsRequest.request({ method: "eth_wrongMethod" }).catch((e) => {
      expect(e.message).to.be.equal(
        "the method eth_wrongMethod does not exist/is not available"
      );
    });
    const blockNumber = await wsRequest.request({ method: "eth_blockNumber" });
    expect(blockNumber).to.be.a("string");
    const balance = await wsRequest.request({
      method: "eth_getBalance",
      params: ["0xDECAF9CD2367cdbb726E904cD6397eDFcAe6068D", "latest"],
    });
    expect(balance).to.be.a("string");
    wsRequest.disconnect();
  }).timeout(3000);
});
