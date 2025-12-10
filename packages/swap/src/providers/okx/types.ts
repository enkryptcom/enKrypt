/**
 * OKX DEX Aggregator API Types - Updated
 */

export interface OKXTokenInfo {
  /** Token address */
  tokenContractAddress: string;
  /** Token name */
  tokenName: string;
  /** Token symbol */
  tokenSymbol: string;
  /** Token decimals */
  decimal: string;
  /** Token logo URL */
  tokenLogoUrl: string;
}

export interface OKXQuoteResponse {
  /** Chain ID */
  chainId: string;
  /** Chain Index */
  chainIndex: string;
  /** Swap mode */
  swapMode: string;
  /** Input token amount */
  fromTokenAmount: string;
  /** Output token amount */
  toTokenAmount: string;
  /** Original output token amount */
  originToTokenAmount: string;
  /** Price impact percentage */
  priceImpactPercentage: string;
  /** Trade fee in USD */
  tradeFee: string;
  /** Estimated gas fee */
  estimateGasFee: string;
  /** DEX router list */
  dexRouterList: {
    router: string;
    routerPercent: string;
    subRouterList: {
      dexProtocol: {
        dexName: string;
        percent: string;
      }[];
      fromToken: {
        decimal: string;
        isHoneyPot: boolean;
        taxRate: string;
        tokenContractAddress: string;
        tokenSymbol: string;
        tokenUnitPrice: string;
      };
      toToken: {
        decimal: string;
        isHoneyPot: boolean;
        taxRate: string;
        tokenContractAddress: string;
        tokenSymbol: string;
        tokenUnitPrice: string;
      };
    }[];
  }[];
  /** Quote comparison list */
  quoteCompareList: {
    amountOut: string;
    dexLogo: string;
    dexName: string;
    tradeFee: string;
  }[];
  /** From token info */
  fromToken: {
    decimal: string;
    isHoneyPot: boolean;
    taxRate: string;
    tokenContractAddress: string;
    tokenSymbol: string;
    tokenUnitPrice: string;
  };
  /** To token info */
  toToken: {
    decimal: string;
    isHoneyPot: boolean;
    taxRate: string;
    tokenContractAddress: string;
    tokenSymbol: string;
    tokenUnitPrice: string;
  };
}

export interface OKXSwapParams {
  /** Chain ID */
  chainId: string;
  /** Amount */
  amount: string;
  /** From token address */
  fromTokenAddress: string;
  /** To token address */
  toTokenAddress: string;
  /** User wallet address */
  userWalletAddress: string;
  /** Slippage */
  slippage: string;
  /** Auto slippage - MUST be string */
  autoSlippage?: string;
  /** Max auto slippage BPS - REQUIRED parameter */
  maxAutoSlippageBps?: string;
  /** Fee percent */
  feePercent?: string;
  /** To token referrer address */
  toTokenReferrerAddress?: string;
  /** Swap receiver address */
  swapReceiverAddress?: string;
  /** From token referrer wallet address */
  fromTokenReferrerWalletAddress?: string;
  /** To token referrer wallet address */
  toTokenReferrerWalletAddress?: string;
  /** From referrer address */
  fromReferrerAddress?: string;
  /** Positive slippage percent */
  positiveSlippagePercent?: string;
  /** Positive slippage fee address */
  positiveSlippageFeeAddress?: string;
  /** Gas limit */
  gasLimit?: string;
  /** Gas level */
  gasLevel?: string;
  /** Compute unit price */
  computeUnitPrice?: string;
  /** Compute unit limit */
  computeUnitLimit?: string;
  /** DEX IDs */
  dexIds?: string;
  /** Direct route */
  directRoute?: boolean;
  /** Price impact protection percentage */
  priceImpactProtectionPercentage?: string;
  /** Call data memo */
  callDataMemo?: string;
  /** Max auto slippage */
  maxAutoSlippage?: string;
}

export interface OKXSwapResponse {
  /** Router result */
  routerResult: OKXQuoteResponse;
  /** Transaction data */
  tx: {
    data: string;
    from: string;
    gas: string;
    gasPrice: string;
    maxPriorityFeePerGas: string;
    minReceiveAmount: string;
    signatureData: string[];
    to: string;
    value: string;
    maxSpendAmount?: string;
  };
}
