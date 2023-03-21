import { Resolution } from "@unstoppabledomains/resolution";
import { BaseResolver, CoinType } from "../types";
import { getTLD } from "../utils";

class UDResolver implements BaseResolver {
  UDProvider: Resolution;

  name: string;

  supportedTLDs = [
    "blockchain",
    "bitcoin",
    "crypto",
    "nft",
    "wallet",
    "x",
    "dao",
    "888",
    "zil",
  ];

  constructor() {
    this.UDProvider = new Resolution({
      sourceConfig: {
        uns: {
          locations: {
            Layer1: {
              url: "https://nodes.mewapi.io/rpc/eth",
              network: "mainnet",
            },
            Layer2: {
              url: "https://nodes.mewapi.io/rpc/matic",
              network: "polygon-mainnet",
            },
          },
        },
      },
    });
    this.name = "ud";
  }

  // eslint-disable-next-line class-methods-use-this, @typescript-eslint/no-empty-function
  public async init(): Promise<void> {}

  public async resolveReverseName(address: string): Promise<string | null> {
    return this.UDProvider.reverse(address)
      .then((name) => name)
      .catch(() => null);
  }

  public async resolveAddress(
    name: string,
    coin: CoinType = "ETH"
  ): Promise<string | null> {
    return this.UDProvider.addr(name, coin)
      .then((address) => address)
      .catch(() => null);
  }

  public isSupportedName(name: string): boolean {
    return this.supportedTLDs.includes(getTLD(name));
  }
}

export default UDResolver;
