import { expect } from "chai";
import { toBN } from "web3-utils";
import Web3Eth from "web3-eth";
import Rango from "../src/providers/rango";
import {
  ProviderName,
  SupportedNetworkName,
  WalletIdentifier,
} from "../src/types";
import {
  fromTokenWBTC,
  toToken,
  fromAddress,
  toAddress,
  nodeURL,
  nodeURLMatic,
  fromTokenNative,
  amount,
} from "./fixtures/mainnet/configs";

describe("Rango Provider", () => {
  // @ts-ignore
  it("it should return a quote", async () => {
    const localAmount = toBN("100000000");
    const web3eth = new Web3Eth(nodeURL);
    const rango = new Rango(web3eth, SupportedNetworkName.Ethereum);
    const init = rango.init();
    await init;
    const quote = await rango.getQuote(
      {
        amount: localAmount,
        fromAddress: "0x9ff58f4ffb29fa2266ab25e75e2a8b3503311656", // aave
        fromToken: fromTokenWBTC,
        toToken,
        toAddress,
      },
      { infiniteApproval: true, walletIdentifier: WalletIdentifier.enkrypt }
    );
    expect(quote?.provider).to.be.eq(ProviderName.rango);
    expect(quote?.quote.meta.infiniteApproval).to.be.eq(true);
    expect(quote?.quote.meta.walletIdentifier).to.be.eq(
      WalletIdentifier.enkrypt
    );
    expect(quote?.fromTokenAmount.toString()).to.be.eq(localAmount.toString());
    expect(quote?.toTokenAmount.gtn(0)).to.be.eq(true);

    const swap = await rango.getSwap(quote!.quote);
    expect(swap?.transactions.length).to.be.eq(2);
    expect(swap?.transactions[0].to).to.be.eq(fromTokenWBTC.address);
  }).timeout(25000);

  it("it should return cross chain swap", async () => {
    const web3eth = new Web3Eth(nodeURLMatic);
    const rango = new Rango(web3eth, SupportedNetworkName.Matic);
    const init = rango.init();
    await init;
    const quote = await rango.getQuote(
      {
        amount,
        fromAddress,
        fromToken: fromTokenNative,
        toToken,
        toAddress,
      },
      { infiniteApproval: true, walletIdentifier: WalletIdentifier.enkrypt }
    );
    expect(quote?.provider).to.be.eq(ProviderName.rango);
    expect(quote?.quote.meta.infiniteApproval).to.be.eq(true);
    expect(quote?.quote.meta.walletIdentifier).to.be.eq(
      WalletIdentifier.enkrypt
    );
    expect(quote?.fromTokenAmount.toString()).to.be.eq(amount.toString());
    expect(quote?.toTokenAmount.gtn(0)).to.be.eq(true);
    expect(quote?.additionalNativeFees.gtn(0)).to.be.eq(true);
    const swap = await rango.getSwap(quote!.quote);
    expect(swap?.transactions.length).to.be.eq(1);
  }).timeout(25000);
});
