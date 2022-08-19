import { expect } from "chai";
import { MiddlewareFunction } from "@enkryptcom/types";
import Request from "../src";

describe("Request calls test", () => {
  const rpcRequest = Request("https://nodes.mewapi.io/rpc/eth", []);
  const wsRequest = Request("wss://nodes.mewapi.io/ws/eth", [], {
    headers: { "User-Agent": " Mozilla/5.0" },
  });
  const requesters = [rpcRequest, wsRequest];
  it("calls should properly respond", async () => {
    // eslint-disable-next-line no-restricted-syntax
    for (const request of requesters) {
      const chainId = await request.request({ method: "eth_chainId" });
      expect(chainId).to.equal("0x1");
      await request.request({ method: "eth_wrongMethod" }).catch((e) => {
        expect(e.message).to.be.equal(
          "the method eth_wrongMethod does not exist/is not available"
        );
      });
      const blockNumber = await request.request({
        method: "eth_blockNumber",
      });
      expect(blockNumber).to.be.a("string");
      const balance = await request.request({
        method: "eth_getBalance",
        params: ["0xDECAF9CD2367cdbb726E904cD6397eDFcAe6068D", "latest"],
      });
      expect(balance).to.be.a("string");
      request.disconnect();
    }
  }).timeout(30000);
});

describe("Middleware calls", () => {
  const middleware1: MiddlewareFunction = (payload, response, next) => {
    if (payload.method !== "eth_testFunc1") return next();
    return response(null, "test result");
  };
  const middleware2: MiddlewareFunction = (payload, response, next) => {
    if (payload.method !== "eth_testFunc2") return next();
    return response(new Error("super crazy error"));
  };
  const rpcRequest = Request("https://nodes.mewapi.io/rpc/eth", [
    middleware1,
    middleware2,
  ]);
  const wsRequest = Request(
    "wss://nodes.mewapi.io/ws/eth",
    [middleware1, middleware2],
    {
      headers: { "User-Agent": " Mozilla/5.0" },
    }
  );
  const requesters = [rpcRequest, wsRequest];
  it("middlewares should respond", async () => {
    // eslint-disable-next-line no-restricted-syntax
    for (const request of requesters) {
      const chainId = await request.request({ method: "eth_chainId" });
      expect(chainId).to.equal("0x1");
      const testFunc = await request.request({ method: "eth_testFunc1" });
      expect(testFunc).to.be.equal("test result");
      await request.request({ method: "eth_testFunc2" }).catch((e) => {
        expect(e.message).to.be.equal("super crazy error");
      });
      request.disconnect();
    }
  }).timeout(3000);
});
