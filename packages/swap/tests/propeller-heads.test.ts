import { expect } from "chai";
import { toBN } from "web3-utils";
import Web3Eth from "web3-eth";
import PropellerHeads from "../src/providers/propeller-heads";
import {
  ProviderName,
  SupportedNetworkName,
  WalletIdentifier,
} from "../src/types";
import { fromTokenWBTC, toToken, nodeURL } from "./fixtures/mainnet/configs";

describe("Propeller Heads Provider", () => {
  const web3eth = new Web3Eth(nodeURL);
  const localAmount = toBN("100000000");

  it("should return a quote with infinite approval", async () => {
    const propellerHeads = new PropellerHeads(
      web3eth,
      SupportedNetworkName.Ethereum
    );

    const quote = await propellerHeads.getQuote(
      {
        amount: localAmount,
        fromAddress: "0x9ff58f4ffb29fa2266ab25e75e2a8b3503311656", // aave
        fromToken: fromTokenWBTC,
        toToken,
        toAddress: "0x9ff58f4ffb29fa2266ab25e75e2a8b3503311656", // aave
      },
      { infiniteApproval: true, walletIdentifier: WalletIdentifier.enkrypt }
    );

    expect(quote?.provider).to.be.eq(ProviderName.propellerHeads);
    expect(quote?.quote.meta.infiniteApproval).to.be.eq(true);
    expect(quote?.quote.meta.walletIdentifier).to.be.eq(
      WalletIdentifier.enkrypt
    );
    expect(typeof quote?.fromTokenAmount).to.be.eq(typeof localAmount);
    expect(quote?.toTokenAmount.gtn(0)).to.be.eq(true);

    const swap = await propellerHeads.getSwap(quote!.quote);

    expect(swap?.transactions.length).to.be.eq(2);
    expect(swap?.transactions[0].to).to.be.eq(fromTokenWBTC.address);
  }).timeout(25000);

  it("should return a quote with non-infinite approval", async () => {
    const propellerHeads = new PropellerHeads(
      web3eth,
      SupportedNetworkName.Ethereum
    );

    const quote = await propellerHeads.getQuote(
      {
        amount: localAmount,
        fromAddress: "0x9ff58f4ffb29fa2266ab25e75e2a8b3503311656", // aave
        fromToken: fromTokenWBTC,
        toToken,
        toAddress: "0x9ff58f4ffb29fa2266ab25e75e2a8b3503311656", // aave
      },
      { infiniteApproval: false, walletIdentifier: WalletIdentifier.enkrypt }
    );

    expect(quote?.provider).to.be.eq(ProviderName.propellerHeads);
    expect(quote?.quote.meta.infiniteApproval).to.be.eq(false);
    expect(quote?.quote.meta.walletIdentifier).to.be.eq(
      WalletIdentifier.enkrypt
    );
    expect(typeof quote?.fromTokenAmount).to.be.eq(typeof localAmount);
    expect(quote?.toTokenAmount.gtn(0)).to.be.eq(true);

    const swap = await propellerHeads.getSwap(quote!.quote);

    expect(swap?.transactions.length).to.be.eq(2);
    expect(swap?.transactions[0].to).to.be.eq(fromTokenWBTC.address);
  }).timeout(25000);
});
