import { ethers } from "ethers";
import SID, { getSidAddress } from "@siddomains/sidjs";
import { BaseResolver } from "../types";
import { getTLD } from "../utils";
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
    const bnbProvider = new ethers.providers.JsonRpcProvider(this.rpc.node.bnb);
    const sidBNB = new SID({
      provider: bnbProvider,
      sidAddress: getSidAddress("56"),
    });
    const nameBnb = await sidBNB.getName(address);
    if (nameBnb) return nameBnb.name;
    const arbProvider = new ethers.providers.JsonRpcProvider(this.rpc.node.arb);
    const sidArb = new SID({
      provider: arbProvider,
      sidAddress: getSidAddress("42161"),
    });
    const nameArb = await sidArb.getName(address);
    if (nameArb) return nameArb.name;
    return null;
  }

  public async resolveAddress(name: string): Promise<string | null> {
    const provider = new ethers.providers.JsonRpcProvider(
      this.rpc.node[getTLD(name)]
    );
    const sid = new SID({
      provider,
      sidAddress: getSidAddress(getTLD(name) === "bnb" ? "56" : "42161"),
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
