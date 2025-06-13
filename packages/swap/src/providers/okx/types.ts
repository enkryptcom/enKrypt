/**
 * OKX DEX Aggregator API Types
 */

export interface OKXTokenInfo {
  /** Token address */
  address: string;
  /** Token name */
  name: string;
  /** Token symbol */
  symbol: string;
  /** Token decimals */
  decimals: string;
}

export interface OKXQuoteResponse {
  /** Input token mint address */
  inputMint: string;
  /** Input amount */
  inAmount: string;
  /** Output token mint address */
  outputMint: string;
  /** Output amount */
  outAmount: string;
  /** Minimum output amount (with slippage) */
  otherAmountThreshold: string;
  /** Swap mode (e.g. "ExactIn") */
  swapMode: string;
  /** Slippage in basis points */
  slippageBps: number;
  /** Platform fee information */
  platformFee: null | {
    /** Fee amount */
    amount: string;
    /** Fee in basis points */
    feeBps: number;
  };
  /** Price impact percentage */
  priceImpactPct: string;
  /** Route plan details */
  routePlan: {
    swapInfo: {
      /** AMM key */
      ammKey: string;
      /** AMM label */
      label: string;
      /** Input token mint */
      inputMint: string;
      /** Output token mint */
      outputMint: string;
      /** Input amount */
      inAmount: string;
      /** Output amount */
      outAmount: string;
      /** Fee amount */
      feeAmount: string;
      /** Fee token mint */
      feeMint: string;
    };
    /** Percentage of route */
    percent: number;
  }[];
  /** Context slot */
  contextSlot: number;
  /** Time taken for quote */
  timeTaken: number;
}

export interface OKXSwapParams {
  /** User's public key */
  userPublicKey: string;
  /** Whether to wrap/unwrap SOL */
  wrapAndUnwrapSol?: boolean;
  /** Use shared accounts */
  useSharedAccounts?: boolean;
  /** Fee account for referral */
  feeAccount?: string;
  /** Tracking account */
  trackingAccount?: string;
  /** Compute unit price in micro-lamports */
  computeUnitPriceMicroLamports?: number;
  /** Prioritization fee in lamports */
  prioritizationFeeLamports?:
    | number
    | "auto"
    | {
        /** Auto multiplier */
        autoMultiplier: number;
      };
  /** Use legacy transaction */
  asLegacyTransaction?: boolean;
  /** Use token ledger */
  useTokenLedger?: boolean;
  /** Destination token account */
  destinationTokenAccount?: string;
  /** Dynamic compute unit limit */
  dynamicComputeUnitLimit?: boolean;
  /** Skip user account RPC calls */
  skipUserAccountRpcCalls?: boolean;
  /** Quote response */
  quoteResponse: OKXQuoteResponse;
}

export interface OKXSwapResponse {
  /** Base64 encoded versioned transaction */
  swapTransaction: string;
  /** Last valid block height */
  lastValidBlockHeight: number;
  /** Prioritization fee in lamports */
  prioritizationFeeLamports?: number;
  /** Compute unit limit */
  computeUnitLimit?: number;
  /** Prioritization type */
  prioritizationType?: {
    computeBudget?: {
      /** Micro-lamports */
      microLamports: number;
      /** Estimated micro-lamports */
      estimatedMicroLamports: number;
    };
  };
  /** Dynamic slippage report */
  dynamicSlippageReport: null | {
    slippageBps?: null | string | number;
    otherAmount?: null | string | number;
    simulatedIncurredSlippageBps?: null | string | number;
    amplificationRatio?: null | string | number;
  };
  /** Simulation error */
  simulationError: null;
} 