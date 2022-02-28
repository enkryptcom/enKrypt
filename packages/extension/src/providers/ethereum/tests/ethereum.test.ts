import { expect } from "chai";
import { Provider as ProviderType } from "@/types/messenger";
import EthereumInject from "../inject";
import {
  ProviderMessage,
  MessageMethod,
  EmitEvent,
  ProviderConnectInfo,
} from "../types";

describe("Test injected Ethereum", () => {
  it("should have default values", async () => {
    expect(EthereumInject.name).to.equal(ProviderType.ethereum);
    const provider = new EthereumInject.provider();
    expect(provider.chainId).to.equal("0x1");
    expect(provider.isEnkrypt).to.equal(true);
  });
});

describe("Test emitted events", () => {
  it("should emit chainChanged", (done) => {
    const provider = new EthereumInject.provider();
    const chainId = "0x5";
    provider.on(EmitEvent.chainChanged, (_chainId) => {
      expect(provider.chainId).to.equal(chainId);
      expect(_chainId).to.equal(chainId);
      done();
    });
    provider.handleMessage(
      JSON.stringify({
        method: MessageMethod.changeChainId,
        params: ["0x5"],
      })
    );
  });
  it("should emit accountsChanged", (done) => {
    const provider = new EthereumInject.provider();
    const address = "0xDECAF9CD2367cdbb726E904cD6397eDFcAe6068D";
    provider.on(EmitEvent.accountsChanged, (addresses) => {
      expect(addresses).deep.equal([address]);
      expect(provider.selectedAddress).to.deep.equal(address);
      done();
    });
    provider.handleMessage(
      JSON.stringify({
        method: MessageMethod.changeAddress,
        params: [address],
      })
    );
  });
  it("should emit connect", (done) => {
    const provider = new EthereumInject.provider();
    const chainId = "0x5";
    provider.on(EmitEvent.connect, (connectionInfo) => {
      expect(connectionInfo).deep.equal({
        chainId,
      });
      expect(provider.chainId).to.equal(chainId);
      done();
    });
    provider.handleMessage(
      JSON.stringify({
        method: MessageMethod.changeConnected,
        params: [true, chainId],
      })
    );
  });
  it("should emit disconnect", (done) => {
    const provider = new EthereumInject.provider();
    const disconnectCode = 4901;
    provider.on(EmitEvent.disconnect, (connectionInfo) => {
      expect(connectionInfo).deep.equal({
        code: 4901,
        message:
          "Chain Disconnected: The Provider is not connected to the requested chain.",
      });
      expect(provider.isConnected()).to.equal(false);
      done();
    });
    provider.handleMessage(
      JSON.stringify({
        method: MessageMethod.changeConnected,
        params: [false, disconnectCode],
      })
    );
  });
});
