import { expect } from "chai";
import { ProviderName, ProviderType, Provider } from "@/types/provider";
import EthereumInject from "../inject";
import { MessageMethod, EmitEvent } from "../types";
import { OnMessageResponse } from "@enkryptcom/types";

const providerSendMessage = async (
  provider: Provider,
  message: string
): Promise<OnMessageResponse> => {
  return {
    result: `dummy-response-${provider.name}-${message}`,
  };
};
const options = {
  name: ProviderName.ethereum,
  type: ProviderType.evm,
  sendMessageHandler: providerSendMessage,
};
const tempWindow: EnkryptWindow = {
  enkrypt: {
    providers: {},
  },
};
describe("Test injected Ethereum", () => {
  it("should have default values", async () => {
    EthereumInject(tempWindow, options);
    const provider = tempWindow[ProviderName.ethereum] as Provider;
    expect(provider.name).to.equal(ProviderName.ethereum);
    expect(provider.chainId).to.equal("0x1");
    expect(provider.isEnkrypt).to.equal(true);
    expect(provider).to.deep.equal(tempWindow.enkrypt.providers[provider.name]);
  });
});

describe("Test emitted events", () => {
  it("should emit chainChanged", (done) => {
    EthereumInject(tempWindow, options);
    const provider = tempWindow[ProviderName.ethereum] as Provider;
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
    EthereumInject(tempWindow, options);
    const provider = tempWindow[ProviderName.ethereum] as Provider;
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
    EthereumInject(tempWindow, options);
    const provider = tempWindow[ProviderName.ethereum] as Provider;
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
    EthereumInject(tempWindow, options);
    const provider = tempWindow[ProviderName.ethereum] as Provider;
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
