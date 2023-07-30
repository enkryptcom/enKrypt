import { expect } from "chai";
import { ProviderName, ProviderType, EthereumProvider } from "@/types/provider";
import EthereumInject from "../inject";
import { MessageMethod, EmitEvent } from "../types";
import { OnMessageResponse } from "@enkryptcom/types";
import { EnkryptWindow } from "@/types/globals";

const providerSendMessage = async (
  provider: ProviderName,
  message: string
): Promise<OnMessageResponse> => {
  return {
    result: `dummy-response-${provider}-${message}`,
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
    settings: {
      evm: {
        inject: {
          disabled: false,
          timestamp: 0,
        },
      },
      substrate: {
        injectPolkadotjs: false,
      },
    },
  },
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  addEventListener: () => {},
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  CustomEvent: () => {},
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  dispatchEvent: () => {},
};
describe("Test injected Ethereum", () => {
  it("should have default values", async () => {
    EthereumInject(tempWindow, options);
    const provider = tempWindow[ProviderName.ethereum] as EthereumProvider;
    expect(provider.name).to.equal(ProviderName.ethereum);
    expect(provider.chainId).to.equal(null);
    expect(provider.isEnkrypt).to.equal(true);
  });
});

describe("Test emitted events", () => {
  it("should emit chainChanged", (done) => {
    EthereumInject(tempWindow, options);
    const provider = tempWindow[ProviderName.ethereum] as EthereumProvider;
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
    const provider = tempWindow[ProviderName.ethereum] as EthereumProvider;
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
    const provider = tempWindow[ProviderName.ethereum] as EthereumProvider;
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
    const provider = tempWindow[ProviderName.ethereum] as EthereumProvider;
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
