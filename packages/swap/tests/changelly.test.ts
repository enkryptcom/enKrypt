import { expect } from "chai";
import Web3Eth from "web3-eth";
import { NATIVE_TOKEN_ADDRESS } from "../src/configs";
import Changelly from "../src/providers/changelly";
import {
  EVMTransaction,
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

describe("Changelly Provider", () => {
  // @ts-ignore
  const web3eth = new Web3Eth(nodeURL);
  const changelly = new Changelly(web3eth, SupportedNetworkName.Ethereum);
  const init = changelly.init();
  it("it should return a quote ", async () => {
    await init;
    const quote = await changelly.getQuote(
      {
        amount,
        fromAddress,
        fromToken,
        toToken,
        toAddress,
      },
      { infiniteApproval: true, walletIdentifier: WalletIdentifier.enkrypt }
    );
    expect(quote?.provider).to.be.eq(ProviderName.changelly);
    expect(quote?.quote.meta.infiniteApproval).to.be.eq(true);
    expect(quote?.quote.meta.walletIdentifier).to.be.eq(
      WalletIdentifier.enkrypt
    );
    expect(quote?.fromTokenAmount.toString()).to.be.eq(
      quote?.minMax.minimumFrom.toString()
    );
    expect(quote?.toTokenAmount.gtn(0)).to.be.eq(true);
    const swap = await changelly.getSwap(quote!.quote);

    expect(swap?.transactions.length).to.be.eq(1);
    expect(
      (swap?.transactions[0] as EVMTransaction).data.startsWith("0xa9059cbb")
    ).to.be.eq(true);
    const status = await changelly.getStatus(
      (
        await swap!.getStatusObject({ transactionHashes: [] })
      ).options
    );
    expect(status).to.be.eq("pending");
  }).timeout(15000);

  it("it should return correct tokens", async () => {
    await init;
    const toTokens = changelly.getToTokens();
    expect(
      Object.values(toTokens[SupportedNetworkName.Polkadot]).length
    ).to.be.eq(1);
    expect(
      Object.values(toTokens[SupportedNetworkName.Bitcoin]).length
    ).to.be.eq(1);
    expect(
      Object.values(toTokens[SupportedNetworkName.EthereumClassic]).length
    ).to.be.eq(1);
  });

  it("it should initialize other networks: Bitcoin", async () => {
    const changelly2 = new Changelly(web3eth, SupportedNetworkName.Bitcoin);
    await changelly2.init();
    const fromTokens = changelly2.getFromTokens();
    expect(Object.values(fromTokens).length).to.be.eq(1);
    expect(fromTokens[NATIVE_TOKEN_ADDRESS].name).to.be.eq("Bitcoin");
  });

  it("it should initialize other networks: Polkadot", async () => {
    const changelly2 = new Changelly(web3eth, SupportedNetworkName.Polkadot);
    await changelly2.init();
    const fromTokens = changelly2.getFromTokens();
    expect(Object.values(fromTokens).length).to.be.eq(1);
    expect(fromTokens[NATIVE_TOKEN_ADDRESS].name).to.be.eq("Polkadot");
  });
});
