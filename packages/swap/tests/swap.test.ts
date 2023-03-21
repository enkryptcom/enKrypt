import { expect } from "chai";
import Web3Eth from "web3-eth";
import Swap from "../src";
import { NATIVE_TOKEN_ADDRESS } from "../src/configs";
import { SupportedNetworkName, WalletIdentifier } from "../src/types";
import { nodeURL } from "./fixtures/mainnet/configs";

describe("Swap", () => {
  // @ts-ignore
  const web3eth = new Web3Eth(nodeURL);
  const enkryptSwap = new Swap({
    api: web3eth,
    network: SupportedNetworkName.Ethereum,
    walletIdentifier: WalletIdentifier.enkrypt,
    evmOptions: {
      infiniteApproval: true,
    },
  });

  it("it should all From tokens", async () => {
    await enkryptSwap.initPromise;
    const fromTokens = enkryptSwap.getFromTokens();
    expect(fromTokens[0].address).to.be.eq(NATIVE_TOKEN_ADDRESS);
    expect(fromTokens.length).to.be.gt(4000);
  });

  it("it should all To tokens", async () => {
    await enkryptSwap.initPromise;
    const toTokens = enkryptSwap.getToTokens();
    expect(toTokens[SupportedNetworkName.Bitcoin].length).to.be.eq(1);
    expect(toTokens[SupportedNetworkName.Bitcoin][0].address).to.be.eq(
      NATIVE_TOKEN_ADDRESS
    );
    expect(toTokens[SupportedNetworkName.Polkadot].length).to.be.eq(1);
    expect(toTokens[SupportedNetworkName.Ethereum].length).to.be.gt(4000);
    expect(toTokens[SupportedNetworkName.Ethereum][0].address).to.be.eq(
      NATIVE_TOKEN_ADDRESS
    );
  });
});
