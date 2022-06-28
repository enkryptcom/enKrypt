import EvmAPI from "@/providers/ethereum/libs/api";
import MarketData from "@/libs/market-data";
import { FiatMarket } from "@/libs/market-data/types";
import { ApiPromise } from "@polkadot/api";
import BigNumber from "bignumber.js";

export interface BaseTokenOptions {
  name: string;
  symbol: string;
  decimals: number;
  icon: string;
  coingeckoID?: string;
  existentialDeposit?: BigNumber;
}

export abstract class BaseToken {
  public name: string;
  public symbol: string;
  public decimals: number;
  public icon: string;
  public coingeckoID: string | undefined;
  public existentialDeposit: BigNumber | undefined;

  constructor(options: BaseTokenOptions) {
    this.name = options.name;
    this.symbol = options.symbol;
    this.decimals = options.decimals;
    this.icon = options.icon;
    this.coingeckoID = options.coingeckoID;
    this.existentialDeposit = options.existentialDeposit;
  }

  public async getTokenPrice(): Promise<FiatMarket | null> {
    if (this.coingeckoID) {
      const market = new MarketData();
      return market.getFiatValue(this.symbol);
    }

    return null;
  }

  public abstract getUserBalance(
    api: EvmAPI | ApiPromise,
    address: string
  ): Promise<string>;
  public abstract send(api: any, to: string, amount: number): Promise<any>;
}
