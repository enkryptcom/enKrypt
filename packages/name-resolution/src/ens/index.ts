import { ethers } from "ethers";
import { formatsByName } from "@ensdomains/address-encoder";
import { BaseResolver, CoinType } from "../types";
import { ENSOptions } from "./types";
import { getTLD } from "../utils";

class ENSResolver implements BaseResolver {
  options: ENSOptions;

  name: string;

  ENSProvider: ethers.providers.JsonRpcProvider;

  constructor(options: ENSOptions) {
    this.options = options;
    this.name = "ens";
  }

  public async init(): Promise<void> {
    this.ENSProvider = new ethers.providers.JsonRpcProvider(this.options.node);
  }

  public async resolveReverseName(address: string): Promise<string | null> {
    const nameAddress = await this.ENSProvider.lookupAddress(address);
    if (nameAddress) return nameAddress;
    return null;
  }

  public async resolveAddress(
    name: string,
    coin: CoinType = "ETH"
  ): Promise<string | null> {
    const resolver = await this.ENSProvider.getResolver(name);
    if (resolver) {
      return resolver
        .getAddress(formatsByName[coin].coinType)
        .then((address) => {
          if (address) return address;
          return null;
        });
    }
    return null;
  }

  // eslint-disable-next-line class-methods-use-this
  public isSupportedName(name: string): boolean {
    return getTLD(name).length > 2;
  }
}

export default ENSResolver;
