import {
  AccountMeta,
  ComputeBudgetInstruction,
  ComputeBudgetProgram,
  TransactionInstruction,
  VersionedTransaction,
} from "@solana/web3.js";

/**
 * @see https://solana.com/docs/core/fees#prioritization-fees
 *
 * > Transactions can only contain one of each type of compute budget
 *   instruction. Duplicate instruction types will result in an
 *   TransactionError::DuplicateInstruction error, and ultimately
 *   transaction failure.
 */
export function extractComputeBudget(
  tx: VersionedTransaction
): undefined | number {
  // extract the compute budget
  let computeBudget: undefined | number;

  // eslint-disable-next-line no-restricted-syntax, no-labels
  instructionLoop: for (
    let i = 0, len = tx.message.compiledInstructions.length;
    i < len;
    i++
  ) {
    const instr = tx.message.compiledInstructions[i];
    const program = tx.message.staticAccountKeys[instr.programIdIndex];
    if (!ComputeBudgetProgram.programId.equals(program)) continue;

    const keys = instr.accountKeyIndexes.map(
      (accountKeyIndex): AccountMeta => ({
        pubkey: tx.message.staticAccountKeys[accountKeyIndex],
        isSigner: tx.message.isAccountSigner(accountKeyIndex),
        isWritable: tx.message.isAccountWritable(accountKeyIndex),
      })
    );

    // Decompile the instruction
    const instruction = new TransactionInstruction({
      keys,
      programId: program,
      data: Buffer.from(instr.data),
    });

    const type = ComputeBudgetInstruction.decodeInstructionType(instruction);
    switch (type) {
      case "SetComputeUnitLimit": {
        // Compute limit
        const command =
          ComputeBudgetInstruction.decodeSetComputeUnitLimit(instruction);
        computeBudget = command.units;
        // eslint-disable-next-line no-labels
        break instructionLoop;
      }
      // You can use this to get the priorty fee
      // case "SetComputeUnitPrice":
      default: /** noop */
        break;
    }
  }

  // (default of 200_000 from Google)
  return computeBudget ?? 200_000;
}
