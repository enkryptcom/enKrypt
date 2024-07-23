import ENSResolver from "./ens";
import { CoinType, NameResolverOptions } from "./types";
import UDResolver from "./ud";
import RNSResolver from "./rns";
import SIDResolver from "./sid";

class NameResolver {
  ens: ENSResolver;

  rns: RNSResolver;

  ud: UDResolver;

  sid: SIDResolver;

  initDone: Promise<void[]>;

  constructor(options: NameResolverOptions) {
    this.ens = new ENSResolver(options.ens);
    this.rns = new RNSResolver();
    this.ud = new UDResolver();
    this.sid = new SIDResolver(options.sid);
    this.initDone = Promise.all([
      this.ens.init(),
      this.rns.init(),
      this.ud.init(),
      this.sid.init(),
    ]);
  }

  public async resolveReverseName(address: string): Promise<string | null> {
    return this.initDone.then(() =>
      Promise.all([
        this.ens.resolveReverseName(address),
        this.sid.resolveReverseName(address),
        this.rns.resolveReverseName(address),
        this.ud.resolveReverseName(address),
      ]).then((results) => {
        // eslint-disable-next-line no-restricted-syntax
        for (const name of results) {
          if (name !== null) return name;
        }
        return null;
      })
    );
  }

  public async resolveAddress(
    name: string,
    coin: CoinType = "ETH"
  ): Promise<string | null> {
    return this.initDone.then(() => {
      if (this.sid.isSupportedName(name)) return this.sid.resolveAddress(name);
      if (this.rns.isSupportedName(name))
        return this.rns.resolveAddress(name, coin);
      if (this.ud.isSupportedName(name))
        return this.ud.resolveAddress(name, coin);
      if (this.ens.isSupportedName(name))
        return this.ens.resolveAddress(name, coin);

      return null;
    });
  }
}
export { ENSResolver, UDResolver, CoinType };
export default NameResolver;
