import { SupportedChains, SNS } from "@bonfida/sns-warp-evm";
import { BaseResolver, CoinType } from "../types";
import { getTLD } from "../utils";
import { ChainMap, Resolvers, SNSOptions } from "./types";

const MAINNET_CHAIN_MAP: ChainMap = {
  "BASE": SupportedChains.BASE,
  "BNB": SupportedChains.BNBMainnet
}

const TESTNET_CHAIN_MAP: ChainMap = {
  "BASE": SupportedChains.BASESepolia,
  "BNB": SupportedChains.BNBTestNet
}

class SNSResolver implements BaseResolver {
  options: SNSOptions;

  name: string;

  chainMap: ChainMap;

  chainResolvers: Resolvers;

  constructor(options: SNSOptions) {
    this.options = options;
    this.name = "sns";
    this.chainMap = options.network === "testnet"
      ? TESTNET_CHAIN_MAP
      : MAINNET_CHAIN_MAP;
    this.chainResolvers = Object.fromEntries(
      Object.entries(this.chainMap).map(([key, val]) => (
        [key, new SNS(val)]
      ))
    );
  }

  // eslint-disable-next-line class-methods-use-this, @typescript-eslint/no-empty-function
  public async init(): Promise<void> { }

  // eslint-disable-next-line class-methods-use-this, @typescript-eslint/no-unused-vars
  public async resolveReverseName(_address: string): Promise<string | null> {
    return null
  }

  public async resolveAddress(
    name: string,
    coin: CoinType = "ETH"
  ): Promise<string | null> {
    const resolver = this.chainResolvers[coin];
    if (resolver) {
      return resolver.resolveName(name)
        .then((address) => address ?? null)
        .catch(() => null)
    }

    return null
  }

  // eslint-disable-next-line class-methods-use-this
  public isSupportedName(name: string): boolean {
    return getTLD(name) === "sol";
  }
}

export default SNSResolver;
