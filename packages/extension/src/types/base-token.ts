import EvmAPI from "@/providers/ethereum/libs/api";
import MarketData from "@/libs/market-data";
import { ApiPromise } from "@polkadot/api";
import BitcoinAPI from "@/providers/bitcoin/libs/api";
import { BN } from "ethereumjs-util";

export type TransferType = "keepAlive" | "all" | "allKeepAlive" | "transfer";

export interface SendOptions {
  type: TransferType;
}

export interface BaseTokenOptions {
  name: string;
  symbol: string;
  decimals: number;
  icon: string;
  coingeckoID?: string;
  existentialDeposit?: BN;
  balance?: string;
  price?: string;
}

export abstract class BaseToken {
  public name: string;
  public symbol: string;
  public decimals: number;
  public icon: string;
  public coingeckoID: string | undefined;
  public existentialDeposit: BN | undefined;
  public balance?: string;
  public price?: string;

  constructor(options: BaseTokenOptions) {
    this.name = options.name;
    this.symbol = options.symbol;
    this.decimals = options.decimals;
    this.icon = options.icon;
    this.coingeckoID = options.coingeckoID;
    this.existentialDeposit = options.existentialDeposit;
    this.price = options.price || "0";
    this.balance = options.balance;
  }

  public async getLatestPrice(): Promise<string | null> {
    if (this.coingeckoID) {
      const market = new MarketData();

      return market.getTokenPrice(this.coingeckoID).then((price) => {
        if (price) {
          this.price = price;
        }

        return price;
      });
    }

    return null;
  }

  public abstract getLatestUserBalance(
    api: EvmAPI | ApiPromise | BitcoinAPI,
    address: string
  ): Promise<string>;

  public abstract send(
    api: EvmAPI | ApiPromise,
    to: string,
    amount: string,
    options?: SendOptions
  ): Promise<any>;
}
