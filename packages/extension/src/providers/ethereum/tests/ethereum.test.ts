import { expect } from "chai";
import { Provider as ProviderType } from "@/types/messenger";
import EthereumInject from "../inject";

describe("Test injected Ethereum", () => {
  it("all should pass", async () => {
    expect(EthereumInject.name).to.equal(ProviderType.ethereum);
  });
});
