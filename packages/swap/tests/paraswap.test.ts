import { expect } from "chai";
import Web3Eth from "web3-eth";
import { numberToHex } from "web3-utils";
import Parawap, { PARASWAP_APPROVAL_ADDRESS } from "../src/providers/paraswap";
import {
  EVMTransaction,
  ProviderName,
  SupportedNetworkName,
  WalletIdentifier,
} from "../src/types";
import { TOKEN_AMOUNT_INFINITY_AND_BEYOND } from "../src/utils/approvals";
import {
  fromToken,
  toTokenWETH as toToken,
  amount,
  fromAddress,
  toAddress,
  nodeURL,
} from "./fixtures/mainnet/configs";

describe("Paraswap Provider", () => {
  // @ts-ignore
  const web3eth = new Web3Eth(nodeURL);
  const paraSwap = new Parawap(web3eth, SupportedNetworkName.Ethereum);
  it("it should return a quote infinity approval", async () => {
    const quote = await paraSwap.getQuote(
      {
        amount,
        fromAddress,
        fromToken,
        toToken,
        toAddress,
      },
      { infiniteApproval: true, walletIdentifier: WalletIdentifier.enkrypt }
    );
    expect(quote?.provider).to.be.eq(ProviderName.paraswap);
    expect(quote?.quote.meta.infiniteApproval).to.be.eq(true);
    expect(quote?.quote.meta.walletIdentifier).to.be.eq(
      WalletIdentifier.enkrypt
    );
    expect(quote?.fromTokenAmount.toString()).to.be.eq(amount.toString());
    expect(quote?.toTokenAmount.gtn(0)).to.be.eq(true);

    const swap = await paraSwap.getSwap(quote!.quote);
    expect(swap?.transactions.length).to.be.eq(2);
    expect(swap?.transactions[0].to).to.be.eq(fromToken.address);
    expect((swap?.transactions[0] as EVMTransaction).data).to.be.eq(
      `0x095ea7b3000000000000000000000000${PARASWAP_APPROVAL_ADDRESS.replace(
        "0x",
        ""
      )}${TOKEN_AMOUNT_INFINITY_AND_BEYOND.replace("0x", "")}`
    );
    expect(swap?.transactions[1].to).to.be.eq(
      "0xDEF171Fe48CF0115B1d80b88dc8eAB59176FEe57"
    );
  }).timeout(5000);

  it("it should return a quote non infinity approval", async () => {
    const quote = await paraSwap.getQuote(
      {
        amount,
        fromAddress,
        fromToken,
        toToken,
        toAddress,
      },
      { infiniteApproval: false, walletIdentifier: WalletIdentifier.enkrypt }
    );
    expect(quote?.quote.meta.infiniteApproval).to.be.eq(false);
    const swap = await paraSwap.getSwap(quote!.quote);
    expect(swap?.transactions.length).to.be.eq(2);
    expect((swap?.transactions[0] as EVMTransaction).data).to.be.eq(
      `0x095ea7b3000000000000000000000000${PARASWAP_APPROVAL_ADDRESS.replace(
        "0x",
        ""
      )}000000000000000000000000000000000000000000000000${numberToHex(
        amount
      ).replace("0x", "")}`
    );
    expect(swap?.transactions[1].to).to.be.eq(
      "0xDEF171Fe48CF0115B1d80b88dc8eAB59176FEe57"
    );
  }).timeout(5000);
});
