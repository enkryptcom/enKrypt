import { ethers } from "ethers";
import { BaseResolver, CoinType } from "../types";
import { getTLD } from "../utils";
import SID, { getSidAddress } from "@siddomains/sidjs";
import { SIDOptions } from "./types";

class SIDResolver implements BaseResolver {
  name: string;

  supportedTLDs = ["bnb", "arb"];

  rpc: SIDOptions;

  constructor(options: SIDOptions) {
    this.rpc = options;
    this.name = "spaceid";
  }

  // eslint-disable-next-line class-methods-use-this, @typescript-eslint/no-empty-function
  public async init(): Promise<void> {}

  public async resolveReverseName(address: string): Promise<string | null> {
    const provider = new ethers.providers.JsonRpcProvider(this.rpc.node.bnb);

    const sidBNB = new SID({
      provider,
      sidAddress: getSidAddress("56"),
    });
    const name = await sidBNB.getName(address);

    if (name) {
      return name.name;
    } else {
      const provider = new ethers.providers.JsonRpcProvider(this.rpc.node.arb);
      const sidArb = new SID({
        provider,
        sidAddress: getSidAddress("42161"),
      });
      const nameArb = await sidArb.getName(address);
      return nameArb.name;
    }
  }

  public async resolveAddress(
    name: string,
    coin: CoinType = "BNB"
  ): Promise<string | null> {
    console.log("resolveAddress", name, coin);
    const provider = new ethers.providers.JsonRpcProvider(
      this.rpc.node[coin === "BNB" ? "bnb" : "arb"]
    );

    const sid = new SID({
      provider,
      sidAddress: getSidAddress(coin === "BNB" ? "56" : "42161"),
    });

    const address = await sid.name(name).getAddress();
    if (parseInt(address, 16) === 0) {
      return null;
    }
    return address;
  }

  public isSupportedName(name: string): boolean {
    return this.supportedTLDs.includes(getTLD(name));
  }
}

export default SIDResolver;
