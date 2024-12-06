/**
 * curl -sL https://tokens.jup.ag/tokens?tags=verified | jq -C | less -N
 */
export type JupiterTokenInfo = {
  address: string;
  name: string;
  symbol: string;
  decimals: string;
};

// Jupiter API Quote

/**
 * see https://station.jup.ag/api-v6/get-quote
 *
 * ```sh
 * curl -sL -H 'Accept: application/json' 'https://quote-api.jup.ag/v6/quote?inputMint=EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v&outputMint=So11111111111111111111111111111111111111112&amount=5'
 * ```
 */
export type JupiterQuoteResponse = {
  /** @example "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v" */
  inputMint: string;
  /** @example "5" */
  inAmount: string;
  /** @example "So11111111111111111111111111111111111111112" */
  outputMint: string;
  /** @example "35" */
  outAmount: string;
  /** @example "35" */
  otherAmountThreshold: string;
  /** @example "ExactIn" */
  swapMode: string;
  /** @example 50 */
  slippageBps: number;
  /** @example {"amount":"1","feeBps":1} */
  platformFee: null | {
    /** @example '1' */
    amount: string;
    /** @example 1 */
    feeBps: number;
  };
  /** @example "0" */
  priceImpactPct: string;
  routePlan: {
    swapInfo: {
      /** @example "5URw47pYHN9heEQFKtUFeHzTskHwN78bBvKefV5C98fe" */
      ammKey: string;
      /** @example "Oasis" */
      label: string;
      /** @example "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v" */
      inputMint: string;
      /** @example "DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263" */
      outputMint: string;
      /** @example  "5" */
      inAmount: string;
      /** @e xample "28679" */
      outAmount: string;
      /** @exampl e "115" */
      feeAmount: string;
      /** @example "DezXAZ8z7Pn rnRJjz3wXBoRgixCa6xjnB7YaB1pPB263" */
      feeMint: string;
    };
    /** @example 100  */
    percent: number;
  }[];
  /** @example 284606533 */
  contextSlot: number;
  /** @example 0.743937514 */
  timeTaken: number;
};

// Jupiter API Swap

/**
 * @see https://station.jup.ag/api-v6/post-swap
 *
 * HTTP request JSON body to request a Swap transaction for a given quote
 */
export type JupiterSwapParams = {
  userPublicKey: string;
  /** Default: true */
  wrapAndUnwrapSol?: boolean;
  useSharedAccounts?: boolean;
  /** Referral address */
  feeAccount?: string;
  /** Public key used to track transactions */
  trackingAccount?: string;
  /** Integer */
  computeUnitPriceMicroLamports?: number;
  /** Integer */
  prioritizationFeeLamports?:
    | number
    | "auto"
    | {
        /** Integer */
        autoMultiplier: number;
      };
  /** Default: false */
  asLegacyTransaction?: boolean;
  /** Default: false */
  useTokenLedger?: boolean;
  /** Public key of key of token receiver. Default: user's own ATA. */
  destinationTokenAccount?: string;
  /**
   * Simulate the swap to get the compute units (like gas in the EVM) &
   * set in ComputeBudget's compute unit limit.
   *
   * Default: false
   */
  dynamicComputeUnitLimit?: boolean;
  /** Do not do RPC calls to check on user's account. Default: false. */
  skipUserAccountRpcCalls?: boolean;
  /** Response from the Jupiter API quote endpoint */
  quoteResponse: JupiterQuoteResponse;
};

/**
 * @see https://station.jup.ag/api-v6/post-swap
 */
export type JupiterSwapResponse = {
  /** Base64 encoded versioned transaction */
  swapTransaction: string;
  /** @example 265642441 */
  lastValidBlockHeight: number;
  /** @example 99999 */
  prioritizationFeeLamports?: number;
  /** @example 1400000 */
  computeUnitLimit?: number;
  prioritizationType?: {
    computeBudget?: {
      /** @example 71428 */
      microLamports: number;
      /** @example 142856 */
      estimatedMicroLamports: number;
    };
  };
  // TODO: Narrow down
  dynamicSlippageReport: null | {
    slippageBps?: null | string | number;
    otherAmount?: null | string | number;
    simulatedIncurredSlippageBps?: null | string | number;
    amplificationRatio?: null | string | number;
  };
  // TODO: Type
  simulationError: null;
};
