import { NetworkNames } from "@enkryptcom/types";
import { expect } from "chai";
import Web3Eth from "web3-eth";
import { toBN } from "web3-utils";
import OneInch from "../src/providers/oneInch";
import { WalletIdentifier } from "../src/types";

describe("OneInch Provider", () => {
  it("it should return a quote", async () => {
    // @ts-ignore
    const web3eth = new Web3Eth("https://nodes.mewapi.io/rpc/eth");
    const fromAddress = "0x4ac15590723614AB9834193ef4615eD66aC44E52";
    const fromToken = {
      address: "0x6b175474e89094c44da98b954eedeac495271d0f",
      decimals: 18,
      logoURI:
        "https://assets.coingecko.com/coins/images/9956/thumb/4943.png?1636636734",
      name: "Dai",
      symbol: "DAI",
      rank: 18,
      cgId: "dai",
    };
    const toToken = {
      address: "0x111111111117dc0aa78b770fa6a738034120c302",
      decimals: 18,
      logoURI:
        "https://assets.coingecko.com/coins/images/13469/thumb/1inch-token.png?1608803028",
      name: "1inch",
      symbol: "1INCH",
      rank: 100,
      cgId: "1inch",
    };
    const oneInch = new OneInch(web3eth, NetworkNames.Ethereum, []);
    const amount = toBN("10000000000000000000");
    const quote = await oneInch.getQuote(
      {
        amount,
        fromAddress,
        fromNetwork: NetworkNames.Ethereum,
        fromToken,
        toNetwork: NetworkNames.Ethereum,
        toToken,
      },
      { infiniteApproval: true, walletIdentifier: WalletIdentifier.enkrypt }
    );
    expect(quote?.transactions[0].to).to.be.eq(fromToken.address);
    expect(quote?.transactions[1].value).to.be.eq("0x0");
    expect(quote?.fromTokenAmount.toString()).to.be.eq(amount.toString());
    expect(quote?.toTokenAmount.gtn(0)).to.be.eq(true);
  }).timeout(10000);
});
