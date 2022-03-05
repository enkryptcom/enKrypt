import { expect } from "chai";
import {
  ProviderName,
  ProviderType,
  Provider,
  PolkadotProvider,
} from "@/types/provider";
import PolkadotInject from "../inject";
import { OnMessageResponse, RPCRequestType } from "@enkryptcom/types";

const sampleAccount = [
  {
    address: "5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY",
    genesisHash: "",
    name: "abcd",
    type: "sr25519",
  },
];
const requestHandler = (request: string): OnMessageResponse => {
  const req = JSON.parse(request) as RPCRequestType;
  if (req.method === "dot_testMethod")
    return {
      result: JSON.stringify("0xabcdef"),
    };
  if (req.method === "dot_accounts_get")
    return {
      result: JSON.stringify(sampleAccount),
    };
  return {
    error: JSON.stringify({
      code: 4200,
      message:
        "Unsupported Method: The Provider does not support the requested method.",
    }),
  };
};
const providerSendMessage = async (
  provider: ProviderName,
  message: string
): Promise<any> => {
  if (provider === ProviderName.polkadot) {
    const res = requestHandler(message);
    if (res.error) return Promise.reject(JSON.parse(res.error));
    else return JSON.parse(res.result as string);
  }
};
const options = {
  name: ProviderName.polkadot,
  type: ProviderType.substrate,
  sendMessageHandler: providerSendMessage,
};
const tempWindow: EnkryptWindow = {
  enkrypt: {
    providers: {},
  },
};
describe("Test Polkadot reponses", () => {
  it("should send proper responses", async () => {
    PolkadotInject(tempWindow, options);
    const provider = tempWindow["injectedWeb3"]["enkrypt"] as PolkadotProvider;
    const injectedProvider = await provider.enable("dapp");
    expect(
      await injectedProvider.sendMessageHandler(5, { method: "dot_testMethod" })
    ).to.equal("0xabcdef");
    await injectedProvider
      .sendMessageHandler(6, { method: "dot_noOp" })
      .catch((e) => {
        expect(e).to.be.deep.equal({
          code: 4200,
          message:
            "Unsupported Method: The Provider does not support the requested method.",
        });
      });
    expect(await injectedProvider.accounts.get()).to.deep.equal(sampleAccount);
  });
});
