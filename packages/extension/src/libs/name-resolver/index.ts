import NameResolver, { CoinType } from "@enkryptcom/name-resolution";
class GenericNameResolver {
  nameResolver: NameResolver;

  constructor() {
    this.nameResolver = new NameResolver({
      ens: { node: "https://nodes.mewapi.io/rpc/eth" },
      sid: {
        node: {
          bnb: "https://nodes.mewapi.io/rpc/bsc",
          arb: "https://nodes.mewapi.io/rpc/arb",
        },
      },
    });
  }

  async resolveName(name: string, coins: CoinType[]): Promise<string | null> {
    let response: string | null = null;
    for (const coin of coins) {
      response = await this.nameResolver
        .resolveAddress(name, coin)
        .catch(() => null);
      if (response) return response;
    }
    return response;
  }
}

export { CoinType, GenericNameResolver };
