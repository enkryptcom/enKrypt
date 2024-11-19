import { describe, it, expect } from "vitest";
import {
  AddressLookupTableAccount,
  ComputeBudgetInstruction,
  ComputeBudgetProgram,
  Connection,
  TransactionMessage,
  VersionedTransaction,
} from "@solana/web3.js";
import { Jupiter } from "../src/providers/jupiter";
import {
  ProviderName,
  ProviderQuoteResponse,
  ProviderSwapResponse,
  SolanaTransaction,
  SupportedNetworkName,
  WalletIdentifier,
} from "../src/types";
import {
  fromToken,
  amount,
  fromAddress,
  toAddress,
  nodeURL,
  toToken,
} from "./fixtures/solana/configs";

describe("Jupiter Provider", () => {
  const conn = new Connection(nodeURL);
  const jupiter = new Jupiter(conn, SupportedNetworkName.Solana);

  // // TODO:
  // it("Should generate a swap transaction that creates both the source referral fee Associated Token Account and the destination Associated Token Account account if it doesn't exist", async () => {
  //   //
  // })
  //
  // // TODO:
  // it("Should generate a swap transaction that creates the destination Associated Token Account if it doesn't exist", async () => {
  //   //
  // })
  //
  // // TODO:
  // it("Should generate a swap transaction that creates the source referral fee Associated Token Account if it doesn't exist", async () => {
  //   //
  // })
  //
  // // TODO:
  // it("Should generate a swap transaction that creates both the source referral fee Associated Token Account if it doesn't exist", async () => {
  //   //
  // })

  it("Should work", { timeout: 10_000 }, async () => {
    const quote: null | ProviderQuoteResponse = await jupiter.getQuote(
      {
        amount,
        fromAddress,
        fromToken,
        toToken,
        toAddress,
      },
      { infiniteApproval: true, walletIdentifier: WalletIdentifier.enkrypt },
    );
    expect(quote!.provider).to.be.eq(ProviderName.jupiter);
    expect(quote!.quote.meta.infiniteApproval).to.be.eq(true);
    expect(quote!.quote.meta.walletIdentifier).to.be.eq(
      WalletIdentifier.enkrypt,
    );
    expect(quote!.fromTokenAmount.toString()).to.be.eq(amount.toString());
    expect(quote!.toTokenAmount.gtn(0)).to.be.eq(true);

    const swap: ProviderSwapResponse = await jupiter.getSwap(quote!.quote);
    expect(swap.transactions.length).to.be.eq(1);

    const tx = VersionedTransaction.deserialize(
      Buffer.from(
        (swap.transactions[0] as SolanaTransaction).serialized,
        "base64",
      ),
    );

    // Decode the transaction and check some facts about it

    // Get lookup addresses (addresses optimized out of the transaction)
    const addressLookupTableAccounts: AddressLookupTableAccount[] = [];
    for (let i = 0, len = tx.message.addressTableLookups.length; i < len; i++) {
      const addressTableLookup = tx.message.addressTableLookups[i];
      const result = await conn.getAddressLookupTable(
        addressTableLookup.accountKey,
      );
      const addressLookupTableAccount = result.value;
      // eslint-disable-next-line no-unused-expressions
      expect(
        addressLookupTableAccount,
        "Address lookup table account not found",
      ).to.be.ok;
      addressLookupTableAccounts.push(addressLookupTableAccount!);
    }
    // Decode message
    const decompiledMessage = TransactionMessage.decompile(tx.message, {
      addressLookupTableAccounts,
    });

    // Decode instructions
    let computeBudget: undefined | number;
    let priorityRate: undefined | number | bigint;
    for (let i = 0, len = decompiledMessage.instructions.length; i < len; i++) {
      const instruction = decompiledMessage.instructions[i];
      switch (instruction.programId.toBase58()) {
        case ComputeBudgetProgram.programId.toBase58(): {
          const instructionType =
            ComputeBudgetInstruction.decodeInstructionType(instruction);
          switch (instructionType) {
            case "SetComputeUnitLimit": {
              // eslint-disable-next-line no-unused-expressions
              expect(
                computeBudget == null,
                "Multiple SetComputeUnitLimit instructions found in the same transaction",
              ).to.be.ok;
              const command =
                ComputeBudgetInstruction.decodeSetComputeUnitLimit(instruction);
              computeBudget = command.units;
              break;
            }
            case "SetComputeUnitPrice": {
              // eslint-disable-next-line no-unused-expressions
              expect(
                priorityRate == null,
                "Multiple SetComputeUnitPrice instructions found in the same transaction",
              ).to.be.ok;
              const command =
                ComputeBudgetInstruction.decodeSetComputeUnitPrice(instruction);
              priorityRate = command.microLamports;
              break;
            }
            default: /* noop */
          }
          break;
        }
        default: /* noop */
      }
    }

    expect(
      decompiledMessage.payerKey.toBase58(),
      "Payer key is not the from address",
    ).to.equal(fromAddress);
  });
});
