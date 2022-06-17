export interface BaseTokenOptions {
  name: string;
  symbol: string;
  decimals: number;
  icon: string;
  coingeckoID?: string;
}

export abstract class BaseToken {
  public name: string;
  public symbol: string;
  public decimals: number;
  public icon: string;
  public coingeckoID: string | undefined;

  constructor(options: BaseTokenOptions) {
    this.name = options.name;
    this.symbol = options.symbol;
    this.decimals = options.decimals;
    this.icon = options.icon;
    this.coingeckoID = options.coingeckoID;
  }

  public async getTokenPrice(): Promise<number> {
    if (this.coingeckoID) {
      // return getPriceFromCoingeko(this);
      return 0;
    } else {
      return 0;
    }
  }

  public abstract getUserBalance(api: any, address: string): Promise<number>;
  public abstract send(api: any, to: string, amount: number): Promise<any>;
}
