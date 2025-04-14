import { describe, it, expect } from "vitest";
import Web3Eth from "web3-eth";
import { numberToHex } from "web3-utils";
import Zerox from "../src/providers/zerox";
import {
  EVMTransaction,
  ProviderName,
  SupportedNetworkName,
  WalletIdentifier,
} from "../src/types";
import { TOKEN_AMOUNT_INFINITY_AND_BEYOND } from "../src/utils/approvals";
import {
  fromToken,
  zeroxFromAddress,
  toToken,
  amount,
  nodeURL,
} from "./fixtures/mainnet/configs";

const fromAddress = zeroxFromAddress;

describe("Zerox Provider", () => {
  // @ts-ignore
  const web3eth = new Web3Eth(nodeURL);
  const zerox = new Zerox(web3eth, SupportedNetworkName.Ethereum);
  const ZEROX_APPROVAL = "0x0000000000001ff3684f28c67538d4d072c22734";

  if (process.env.CI) {
    // We need at-least one test otherwise vitest reports failure
    it("No ZeroX swap tests in CI", function () {
      expect(true).toBeTruthy();
    });
    return;
  }

  it(
    "it should return a quote infinity approval",
    { timeout: 10_000 },
    async () => {
      const quote = await zerox.getQuote(
        {
          amount,
          fromAddress,
          fromToken,
          toToken,
          toAddress: fromAddress,
        },
        { infiniteApproval: true, walletIdentifier: WalletIdentifier.enkrypt },
      );
      expect(quote?.provider).to.be.eq(ProviderName.zerox);
      expect(quote?.quote.meta.infiniteApproval).to.be.eq(true);
      expect(quote?.quote.meta.walletIdentifier).to.be.eq(
        WalletIdentifier.enkrypt,
      );
      expect(quote?.fromTokenAmount.toString()).to.be.eq(amount.toString());
      expect(quote?.toTokenAmount.gtn(0)).to.be.eq(true);

      const swap = await zerox.getSwap(quote!.quote);
      expect(swap?.transactions.length).to.be.eq(2);
      expect(swap?.transactions[0].to).to.be.eq(fromToken.address);
      expect((swap?.transactions[0] as EVMTransaction).data).to.be.eq(
        `0x095ea7b3000000000000000000000000${ZEROX_APPROVAL.replace(
          "0x",
          "",
        )}${TOKEN_AMOUNT_INFINITY_AND_BEYOND.replace("0x", "")}`,
      );
      expect(swap?.transactions[1].to).to.be.eq(ZEROX_APPROVAL);
    },
  );

  it(
    "it should return a quote non infinity approval",
    { timeout: 10_000 },
    async () => {
      const quote = await zerox.getQuote(
        {
          amount,
          fromAddress,
          fromToken,
          toToken,
          toAddress: fromAddress,
        },
        { infiniteApproval: false, walletIdentifier: WalletIdentifier.enkrypt },
      );
      expect(quote?.quote.meta.infiniteApproval).to.be.eq(false);
      const swap = await zerox.getSwap(quote!.quote);
      expect(swap?.transactions.length).to.be.eq(2);
      expect((swap?.transactions[0] as EVMTransaction).data).to.be.eq(
        `0x095ea7b3000000000000000000000000${ZEROX_APPROVAL.replace(
          "0x",
          "",
        )}00000000000000000000000000000000000000000000000${numberToHex(
          amount,
        ).replace("0x", "")}`,
      );
      expect(swap?.transactions[1].to).to.be.eq(ZEROX_APPROVAL);
    },
  );
});
