export interface RoutescanTxType {
  chainId: string;
  blockNumber: number;
  txIndex: number;
  timestamp: string;
  from: {
    id: string;
    isContract: boolean;
  };
  to: {
    id: string;
    isContract: boolean;
    alias?: string;
    dapp?: any;
    owner?: string;
    icon?: string;
    iconUrls?: Record<string, string>;
    tags?: string[];
  };
  blockHash: string;
  txHash: string;
  value: string;
  gasLimit: string;
  gasUsed: string;
  gasPrice: string;
  burnedFees: string;
  methodId: string;
  method?: string;
  contractVerified?: boolean;
  type: string;
  status: boolean;
}
