import { expect } from "chai";
import Web3Eth from "web3-eth";
import Swap from "../src";
import { NATIVE_TOKEN_ADDRESS } from "../src/configs";
import {
  ProviderName,
  SupportedNetworkName,
  WalletIdentifier,
} from "../src/types";
import {
  fromToken,
  toToken,
  amount,
  fromAddress,
  toAddress,
  nodeURL,
} from "./fixtures/mainnet/configs";

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

  it("it should get all From tokens", async () => {
    await enkryptSwap.initPromise;
    const fromTokens = enkryptSwap.getFromTokens();
    expect(fromTokens.all[0].address).to.be.eq(NATIVE_TOKEN_ADDRESS);
    expect(fromTokens.all.length).to.be.gt(4000);
  });

  it("it should all To tokens", async () => {
    await enkryptSwap.initPromise;
    const toTokens = enkryptSwap.getToTokens();
    expect(toTokens.all[SupportedNetworkName.Bitcoin].length).to.be.eq(1);
    expect(toTokens.all[SupportedNetworkName.Bitcoin][0].address).to.be.eq(
      NATIVE_TOKEN_ADDRESS
    );
    expect(toTokens.all[SupportedNetworkName.Polkadot].length).to.be.eq(1);
    expect(toTokens.all[SupportedNetworkName.Ethereum].length).to.be.gt(4000);
    expect(toTokens.all[SupportedNetworkName.Ethereum][0].address).to.be.eq(
      NATIVE_TOKEN_ADDRESS
    );
    expect(toTokens.top[SupportedNetworkName.Bitcoin][0].address).to.be.eq(
      NATIVE_TOKEN_ADDRESS
    );
  });

  it("it should get quote and swap for different destination", async () => {
    await enkryptSwap.initPromise;
    const quotes = await enkryptSwap.getQuotes({
      amount,
      fromAddress,
      fromToken,
      toToken,
      toAddress,
    });
    expect(quotes?.length).to.be.eq(3);
    const oneInceQuote = quotes.find(
      (q) => q.provider === ProviderName.oneInch
    );
    const paraswapQuote = quotes.find(
      (q) => q.provider === ProviderName.paraswap
    );
    const changellyQuote = quotes.find(
      (q) => q.provider === ProviderName.changelly
    );
    const zeroxQuote = quotes.find((q) => q.provider === ProviderName.zerox);
    expect(zeroxQuote).to.be.eq(undefined);
    expect(changellyQuote!.provider).to.be.eq(ProviderName.changelly);
    expect(oneInceQuote!.provider).to.be.eq(ProviderName.oneInch);
    expect(paraswapQuote!.provider).to.be.eq(ProviderName.paraswap);
    const swapOneInch = await enkryptSwap.getSwap(oneInceQuote!.quote);
    expect(swapOneInch?.fromTokenAmount.toString()).to.be.eq(amount.toString());
    expect(swapOneInch?.transactions.length).to.be.eq(2);
    const swapChangelly = await enkryptSwap.getSwap(changellyQuote!.quote);
    if (swapChangelly) expect(swapChangelly?.transactions.length).to.be.eq(1);
  }).timeout(10000);

  it("it should get quote and swap for same destination", async () => {
    await enkryptSwap.initPromise;
    const quotes = await enkryptSwap.getQuotes({
      amount,
      fromAddress,
      fromToken,
      toToken,
      toAddress: fromAddress,
    });
    expect(quotes?.length).to.be.eq(4);
    const oneInceQuote = quotes.find(
      (q) => q.provider === ProviderName.oneInch
    );
    const paraswapQuote = quotes.find(
      (q) => q.provider === ProviderName.paraswap
    );
    const changellyQuote = quotes.find(
      (q) => q.provider === ProviderName.changelly
    );
    const zeroxQuote = quotes.find((q) => q.provider === ProviderName.zerox);
    expect(zeroxQuote!.provider).to.be.eq(ProviderName.zerox);
    expect(changellyQuote!.provider).to.be.eq(ProviderName.changelly);
    expect(oneInceQuote!.provider).to.be.eq(ProviderName.oneInch);
    expect(paraswapQuote!.provider).to.be.eq(ProviderName.paraswap);
  }).timeout(10000);
});
