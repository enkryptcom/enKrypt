export interface LiFiQuoteResponse {
  tool?: string;
  action?: {
    fromAmount?: string;
    fromChainId?: number;
    toChainId?: number;
  };
  estimate?: {
    fromAmount?: string;
    toAmount?: string;
    approvalAddress?: string;
  };
  transactionRequest?: {
    to: string;
    data: string;
    value?: string;
    gasLimit?: string;
  };
}

export interface LiFiQuoteErrorResponse {
  message?: string;
}

export interface LiFiStatusResponse {
  status?: "NOT_FOUND" | "PENDING" | "DONE" | "FAILED";
  substatus?: "COMPLETED" | "PARTIAL" | "REFUNDED" | string;
}
