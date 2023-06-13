import { expect } from "chai";
import { ProviderName, ProviderType, EthereumProvider } from "@/types/provider";
import EthereumInject from "../inject";
import { EthereumRequest } from "../types";
import { OnMessageResponse } from "@enkryptcom/types";
import { getError } from "@/libs/error";
import { EnkryptWindow } from "@/types/globals";

const requestHandler = (request: string): OnMessageResponse => {
  const req = JSON.parse(request) as EthereumRequest;
  if (req.method === "eth_chainId")
    return {
      result: JSON.stringify("0x1"),
    };
  else if (req.method === "eth_requestAccounts")
    return {
      error: JSON.stringify(getError(4001)),
    };
  else if (req.method === "eth_accounts")
    return {
      result: JSON.stringify(["0xDECAF9CD2367cdbb726E904cD6397eDFcAe6068D"]),
    };
  return {
    error: JSON.stringify(getError(4200)),
  };
};
const providerSendMessage = async (
  provider: ProviderName,
  message: string
): Promise<any> => {
  if (provider === ProviderName.ethereum) {
    const res = requestHandler(message);
    if (res.error) return Promise.reject(JSON.parse(res.error));
    else return JSON.parse(res.result as string);
  }
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
describe("Test Ethereum reponses", () => {
  it("should send proper responses", async () => {
    EthereumInject(tempWindow, options);
    const provider = tempWindow[ProviderName.ethereum] as EthereumProvider;
    expect(await provider.request({ method: "eth_chainId" })).to.equal("0x1");
    await provider.request({ method: "eth_requestAccounts" }).catch((e) => {
      expect(e).to.be.deep.equal({
        code: 4001,
        message: "User Rejected Request: The user rejected the request.",
      });
    });
    await provider.request({ method: "eth_unknownMethod" }).catch((e) => {
      expect(e).to.be.deep.equal({
        code: 4200,
        message:
          "Unsupported Method: The Provider does not support the requested method.",
      });
    });
    await provider.request({ method: "eth_accounts" }).then((res) => {
      expect(res).to.be.deep.equal([
        "0xDECAF9CD2367cdbb726E904cD6397eDFcAe6068D",
      ]);
    });
  });
});
