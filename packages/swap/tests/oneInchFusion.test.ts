import { describe, it, expect } from "vitest";
import Web3Eth from "web3-eth";
import { numberToHex } from "web3-utils";
import OneInchFusion from "../src/providers/oneInchFusion";
import { ONEINCH_APPROVAL_ADDRESS } from "../src/providers/oneInch";
import {
  EVMTransaction,
  ProviderName,
  SupportedNetworkName,
  WalletIdentifier,
} from "../src/types";
import { TOKEN_AMOUNT_INFINITY_AND_BEYOND } from "../src/utils/approvals";
import {
  fromToken,
  toToken,
  amount,
  fromAddress,
  toAddress,
  nodeURL,
} from "./fixtures/mainnet/configs";

describe("OneInchFusion Provider", async () => {
  // @ts-ignore
  const web3eth = new Web3Eth(nodeURL);
  const oneInch = new OneInchFusion(web3eth, SupportedNetworkName.Ethereum);
  oneInch.init([]);
  it(
    "it should return a quote infinity approval",
    { timeout: 10_000 },
    async () => {
      const quote = await oneInch.getQuote(
        {
          amount,
          fromAddress,
          fromToken,
          toToken,
          toAddress,
        },
        { infiniteApproval: true, walletIdentifier: WalletIdentifier.enkrypt },
      );
      expect(quote?.provider).to.be.eq(ProviderName.oneInchFusion);
      expect(quote?.quote.meta.infiniteApproval).to.be.eq(true);
      expect(quote?.quote.meta.walletIdentifier).to.be.eq(
        WalletIdentifier.enkrypt,
      );
      expect(quote?.fromTokenAmount.toString()).to.be.eq(amount.toString());
      expect(quote?.toTokenAmount.gtn(0)).to.be.eq(true);

      const swap = await oneInch.getSwap(quote!.quote);
      expect(swap?.transactions.length).to.be.eq(2);
      expect(swap?.transactions[0].to).to.be.eq(fromToken.address);
      expect((swap?.transactions[0] as EVMTransaction).data).to.be.eq(
        `0x095ea7b3000000000000000000000000${ONEINCH_APPROVAL_ADDRESS.replace(
          "0x",
          "",
        )}${TOKEN_AMOUNT_INFINITY_AND_BEYOND.replace("0x", "")}`,
      );
    },
  );

  it(
    "it should return a quote non infinity approval",
    { timeout: 10_000 },
    async () => {
      const quote = await oneInch.getQuote(
        {
          amount,
          fromAddress,
          fromToken,
          toToken,
          toAddress,
        },
        { infiniteApproval: false, walletIdentifier: WalletIdentifier.enkrypt },
      );
      expect(quote?.quote.meta.infiniteApproval).to.be.eq(false);
      const swap = await oneInch.getSwap(quote!.quote);
      expect(swap?.transactions.length).to.be.eq(2);
      expect((swap?.transactions[0] as EVMTransaction).data).to.be.eq(
        `0x095ea7b3000000000000000000000000${ONEINCH_APPROVAL_ADDRESS.replace(
          "0x",
          "",
        )}00000000000000000000000000000000000000000000000${numberToHex(
          amount,
        ).replace("0x", "")}`,
      );
    },
  );
});
