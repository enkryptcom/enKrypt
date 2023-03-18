export interface OneInchResponseType {
  error?: string;
  description?: string;
  toTokenAmount: string;
  fromTokenAmount: string;
  tx: {
    from: string;
    to: string;
    data: string;
    value: string;
    gasPrice: string;
  };
}
