import {
  AccountMeta,
  AddressLookupTableAccount,
  ComputeBudgetInstruction,
  ComputeBudgetProgram,
  Connection,
  PublicKey,
  SystemProgram,
  TransactionInstruction,
  TransactionMessage,
  VersionedTransaction,
} from "@solana/web3.js";

/**
 * Address of the SPL Token program
 *
 * @see https://solscan.io/account/TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA
 */
export const TOKEN_PROGRAM_ID = new PublicKey(
  "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA",
);

/**
 * Address of the SPL Token 2022 program
 *
 * @see https://solscan.io/account/TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb
 */
export const TOKEN_2022_PROGRAM_ID = new PublicKey(
  "TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb",
);

/**
 * Address of the SPL Associated Token Account program
 *
 * (Creates Associated Token Accounts (ATA))
 *
 * @see https://solscan.io/account/ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL
 */
export const ASSOCIATED_TOKEN_PROGRAM_ID = new PublicKey(
  "ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL",
);

export const SPL_TOKEN_ATA_ACCOUNT_SIZE_BYTES = 165;

/**
 * Wrapped SOL address
 * @see https://solscan.io/token/So11111111111111111111111111111111111111112
 */
export const WRAPPED_SOL_ADDRESS =
  "So11111111111111111111111111111111111111112";

/**
 * @see https://solana.com/docs/core/fees#prioritization-fees
 *
 * > Transactions can only contain one of each type of compute budget
 *   instruction. Duplicate instruction types will result in an
 *   TransactionError::DuplicateInstruction error, and ultimately
 *   transaction failure.
 */
export function extractComputeBudget(
  tx: VersionedTransaction,
): undefined | number {
  // extract the compute budget

  /** Compute units */
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
      }),
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

  /**
   * @see https://solanacookbook.com/references/basic-transactions.html#how-to-change-compute-budget-fee-priority-for-a-transaction
   *
   * Default is minimum of 14m and 200_000 * instruction count
   */
  return (
    computeBudget ??
    Math.min(1_400_000, 200_000 * tx.message.compiledInstructions.length)
  );
}

/**
 * @see https://solana.com/docs/core/fees#prioritization-fees
 */
export function extractComputeUnitPriceMicroLamports(
  tx: VersionedTransaction,
): undefined | number | bigint {
  /** Compute unit price */
  let computeUnitPriceMicroLamports: undefined | number | bigint;

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
      }),
    );

    // Decompile the instruction
    const instruction = new TransactionInstruction({
      keys,
      programId: program,
      data: Buffer.from(instr.data),
    });

    const type = ComputeBudgetInstruction.decodeInstructionType(instruction);
    switch (type) {
      case "SetComputeUnitPrice": {
        // Compute limit
        const command =
          ComputeBudgetInstruction.decodeSetComputeUnitPrice(instruction);
        computeUnitPriceMicroLamports = command.microLamports;
        // eslint-disable-next-line no-labels
        break instructionLoop;
      }
      default: /** noop */
        break;
    }
  }

  return computeUnitPriceMicroLamports;
}

/**
 * Insert new instructions at the start of a transaction, after compute budget and compute limit instructions
 */
export async function insertInstructionsAtStartOfTransaction(
  conn: Connection,
  tx: VersionedTransaction,
  instructions: TransactionInstruction[],
): Promise<VersionedTransaction> {
  if (instructions.length === 0) return tx;

  // Now we need to:
  // 1. Decompile the transaction
  // 2. Put our instructions in it
  // 3. Recompile it

  // Request lookup accounts so that we can decompile the message
  //
  // Lookup accounts store arrays of addresses. These accounts let compiled transaction messages reference indexes
  // in the lookup account rather than by the pubkey, saving lots of space (~4 byte integer index vs 32 byte pubkey).
  //
  // To decompile a message we first need all the lookup accounts that it includes so that we can get the
  // the addresses that our message needs.
  //
  // We can also use the lookup accounts when re-compiling the transaction.
  const lookupAccountsCount = tx.message.addressTableLookups.length;
  const addressLookupTableAccounts: AddressLookupTableAccount[] = new Array(
    lookupAccountsCount,
  );

  for (let i = 0; i < lookupAccountsCount; i++) {
    const lookup = tx.message.addressTableLookups[i];
    const result = await conn.getAddressLookupTable(lookup.accountKey);
    const addressLookupTableAccount = result.value;
    if (addressLookupTableAccount == null)
      throw new Error(
        `Failed to get address lookup table for ${lookup.accountKey}`,
      );
    // debug(
    //   "insertInstructionsAtStartOfTransaction",
    //   `Fetching lookup account ${i + 1}. ${lookup.accountKey.toBase58()}`
    // );
    addressLookupTableAccounts[i] = addressLookupTableAccount;
  }

  // Decompile the transaction message so we can modify it
  const decompiledTransactionMessage = TransactionMessage.decompile(
    tx.message,
    { addressLookupTableAccounts },
  );

  // Insert our instruction to create an account directly after compute budget
  // program instructions that compute limits and priority fees
  const computeBudgetProgramAddr = ComputeBudgetProgram.programId.toBase58();
  let inserted = false;
  // eslint-disable-next-line no-restricted-syntax, no-labels
  instructionLoop: for (
    let i = 0, len = decompiledTransactionMessage.instructions.length;
    i < len;
    i++
  ) {
    // As soon as we hit a non compute budget program, insert our instruction to create the account
    const existingInstruction = decompiledTransactionMessage.instructions[i];
    switch (existingInstruction.programId.toBase58()) {
      case computeBudgetProgramAddr:
        // do nothing
        break;
      default: {
        // insert our instruction here & continue
        // debug(
        //   "insertInstructionsAtStartOfTransaction",
        //   `Inserting instruction to create an ATA account for Jupiter referrer with mint at instruction index ${i}`
        // );
        inserted = true;
        decompiledTransactionMessage.instructions.splice(i, 0, ...instructions);
        // eslint-disable-next-line no-labels
        break instructionLoop;
      }
    }
  }

  if (!inserted) {
    // If there were no compute budget instructions then just add it at the start
    // debug(
    //   "insertInstructionsAtStartOfTransaction",
    //   `Inserting instruction to create an ATA account for Jupiter referrer with mint at start of instructions`
    // );
    for (let len = instructions.length - 1, i = len - 1; i >= 0; i--) {
      decompiledTransactionMessage.instructions.unshift(instructions[i]);
    }
  }

  // Switch to using this modified transaction
  // debug("insertInstructionsAtStartOfTransaction", `Re-compiling transaction`);
  const modifiedTx = new VersionedTransaction(
    decompiledTransactionMessage.compileToV0Message(addressLookupTableAccounts),
  );

  return modifiedTx;
}

/**
 * Get the SPL token program that owns (/created) the given mint (token). Either the SPL token program
 * or the 2022 SPL token program
 *
 * @returns   Pubkey of the SPL token token owner program
 * @throws    If the account does not exist or if it's not owned by one of the SPL token programs
 */
export async function getTokenProgramOfMint(
  conn: Connection,
  mint: PublicKey,
): Promise<PublicKey> {
  // debug("getTokenProgramOfMint", `Checking mint account of ${mint.toBase58()}`);
  const srcMintAcc = await conn.getAccountInfo(mint);

  if (srcMintAcc == null) {
    throw new Error(
      `There is no SPL token account at address ${mint.toBase58()}`,
    );
  }

  switch (srcMintAcc.owner.toBase58()) {
    case TOKEN_PROGRAM_ID.toBase58():
    case TOKEN_2022_PROGRAM_ID.toBase58():
      return srcMintAcc.owner;
    default:
      throw new Error(
        `Mint address is not a valid SPL token, must either have owner` +
          ` TOKEN_PROGRAM_ID (${TOKEN_PROGRAM_ID.toBase58()})` +
          ` or TOKEN_2022_PROGRAM_ID (${TOKEN_2022_PROGRAM_ID.toBase58()})`,
      );
  }
}

/**
 * Get the SPL token ATA pubkey for a wallet with a mint
 */
export function getSPLAssociatedTokenAccountPubkey(
  wallet: PublicKey,
  mint: PublicKey,
  /** Either the SPL token program or the 2022 SPL token program */
  tokenProgramId: PublicKey,
): PublicKey {
  const SEED = [wallet.toBuffer(), tokenProgramId.toBuffer(), mint.toBuffer()];
  const [associatedTokenAddress] = PublicKey.findProgramAddressSync(
    SEED,
    ASSOCIATED_TOKEN_PROGRAM_ID,
  );
  return associatedTokenAddress;
}

/**
 * Construct a CreateAssociatedTokenAccountIdempotent instruction
 *
 * @param payer                    Payer of the initialization fees
 * @param associatedToken          New associated token account
 * @param owner                    Owner of the new account
 * @param mint                     Token mint account
 * @param programId                SPL Token program account
 * @param associatedTokenProgramId SPL Associated Token program account
 *
 * @return Instruction to add to a transaction
 */
export function createAssociatedTokenAccountIdempotentInstruction(
  payer: PublicKey,
  associatedToken: PublicKey,
  owner: PublicKey,
  mint: PublicKey,
  programId = TOKEN_PROGRAM_ID,
  associatedTokenProgramId = ASSOCIATED_TOKEN_PROGRAM_ID,
): TransactionInstruction {
  // eslint-disable-next-line no-use-before-define
  return buildAssociatedTokenAccountInstruction(
    payer,
    associatedToken,
    owner,
    mint,
    Buffer.from([1]),
    programId,
    associatedTokenProgramId,
  );
}

export function buildAssociatedTokenAccountInstruction(
  payer: PublicKey,
  associatedToken: PublicKey,
  owner: PublicKey,
  mint: PublicKey,
  instructionData: Buffer,
  programId = TOKEN_PROGRAM_ID,
  associatedTokenProgramId = ASSOCIATED_TOKEN_PROGRAM_ID,
): TransactionInstruction {
  const keys = [
    { pubkey: payer, isSigner: true, isWritable: true },
    { pubkey: associatedToken, isSigner: false, isWritable: true },
    { pubkey: owner, isSigner: false, isWritable: false },
    { pubkey: mint, isSigner: false, isWritable: false },
    { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
    { pubkey: programId, isSigner: false, isWritable: false },
  ];

  return new TransactionInstruction({
    keys,
    programId: associatedTokenProgramId,
    data: instructionData,
  });
}

/**
 * Create a transaction instruction that creates the given ATA for the owner and mint.
 *
 * Does nothing if the mint already exists.
 *
 * @see https://github.com/solana-labs/solana-program-library/blob/e018a30e751e759e62e17ad01864d4c57d090c26/token/js/src/instructions/associatedTokenAccount.ts#L49
 * @see https://github.com/solana-labs/solana-program-library/blob/e018a30e751e759e62e17ad01864d4c57d090c26/token/js/src/instructions/associatedTokenAccount.ts#L100
 */
export function getCreateAssociatedTokenAccountIdempotentInstruction(params: {
  /** Payer of initialization / rent fees */
  payerPubkey: PublicKey;
  /** Address of the Associated Token Account of `ownerPubkey` with `mintPubkey` @see `getSPLAssociatedTokenAccountPubkey` */
  ataPubkey: PublicKey;
  /** Owner of the new SPL Associated Token Account */
  ownerPubkey: PublicKey;
  /**
   * SPL token address
   *
   * @example new PublicKey('EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v') // USDC
   * @example new PublicKey('Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB') // USDT
   * @example new PublicKey('So11111111111111111111111111111111111111112') // Wrapped SOL
   *
   * USDC @see https://solscan.io/token/EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v
   * USDT @see https://solscan.io/token/Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB
   * Wrapped SOL @see https://solscan.io/token/So11111111111111111111111111111111111111112
   */
  mintPubkey: PublicKey;
  /**
   * @example new PublicKey('11111111111111111111111111111111')
   */
  systemProgramId: PublicKey;
  /**
   * SPL Token Program or 2022 SPL token program
   *
   * @example new PublicKey('TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA')
   * @example new PublicKey('TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb')
   */
  tokenProgramId: PublicKey;
  /**
   * SPL Associated Token Program account,
   *
   * @example new PublicKey('ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL')
   *
   * @see https://solscan.io/account/ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL
   */
  associatedTokenProgramId: PublicKey;
}): TransactionInstruction {
  const {
    payerPubkey,
    ataPubkey,
    ownerPubkey,
    mintPubkey,
    systemProgramId,
    tokenProgramId,
    associatedTokenProgramId,
  } = params;

  const keys = [
    { pubkey: payerPubkey, isSigner: true, isWritable: true },
    { pubkey: ataPubkey, isSigner: false, isWritable: true },
    { pubkey: ownerPubkey, isSigner: false, isWritable: false },
    { pubkey: mintPubkey, isSigner: false, isWritable: false },
    { pubkey: systemProgramId, isSigner: false, isWritable: false },
    { pubkey: tokenProgramId, isSigner: false, isWritable: false },
  ];

  return new TransactionInstruction({
    keys,
    programId: associatedTokenProgramId,
    data: Buffer.from([1]),
  });
}

/**
 * Is the address a valid Solana address? (32 byte base58 string)
 *
 * @param address   hopefully 32 byte base58 string
 * @returns         true if `address` is a 32 byte base58 string
 */
export function isValidSolanaAddress(address: string): boolean {
  try {
    // eslint-disable-next-line no-new
    new PublicKey(address);
    return true;
  } catch (err) {
    return false;
  }
}

export async function isValidSolanaAddressAsync(
  address: string,
): Promise<boolean> {
  return isValidSolanaAddress(address);
}

/**
 * Does the Solana account exist?
 *
 * Checks if the account has been created
 *
 * @param conn      Solana connection
 * @param address   Address to check
 * @returns         `true` if there's an account at `address`
 */
export async function solAccountExists(
  conn: Connection,
  address: PublicKey,
): Promise<boolean> {
  const account = await conn.getAccountInfo(address, "max");
  const exists = account != null;
  return exists;
}
