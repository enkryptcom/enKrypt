import { createWeb3Name } from "@web3-name-sdk/core";
import { BaseResolver } from "../types";
import {
  PAYMENT_ID_CHAINS_MAP,
  PaymentIdChain,
  SIDOptions,
  TIMEOUT_PRESETS,
} from "./types";
import { createSolName } from "@web3-name-sdk/core/solName";
import { createPaymentIdName } from "@web3-name-sdk/core/paymentIdName";
import { isValidPaymentId } from "./utils";
import { getTLD } from "../utils";
// demo: https://sdk-demo-git-main-space-id.vercel.app/

const evm_tlds = [
  "bnb",
  "arb",
  "wod",
  "mph",
  "g",
  "btc",
  "burger",
  "alien",
  "zkf",
  "merlin",
  "taiko",
  "tomo",
  "gno",
  "floki",
  "ll",
  "ip",
  "mode",
  "mint",
  "manta",
  "cake",
  "zeta",
  "ail",
  "duck",
];

class SIDResolver implements BaseResolver {
  name: string;
  timeout: number;
  // The supported tlds for sid in evm and solana
  supportedTLDs = ["sol", ...evm_tlds];
  rpc: SIDOptions;
  solanaNameResolver: ReturnType<typeof createSolName>;
  paymentIdNameResolver: ReturnType<typeof createPaymentIdName>;
  web3NameResolver: ReturnType<typeof createWeb3Name>;

  constructor(options: SIDOptions) {
    this.rpc = options;
    this.timeout = options.timeout || TIMEOUT_PRESETS.normal;
    this.name = "spaceid";
    this.solanaNameResolver = createSolName({ timeout: this.timeout });
    this.paymentIdNameResolver = createPaymentIdName();
    this.web3NameResolver = createWeb3Name();
  }

  public async init(): Promise<void> {}

  // The PaymentId only supports getAddress resolution.
  public async handlePaymentIdGetAddress(
    name: string,
    paymentIdChain?: string,
  ): Promise<string | null> {
    return await this.paymentIdNameResolver.getAddress({
      name,
      chainId:
        PAYMENT_ID_CHAINS_MAP[paymentIdChain?.toLowerCase()] ||
        PaymentIdChain.Ethereum,
    });
  }

  public async resolveReverseName(address: string): Promise<string | null> {
    try {
      let name = await this.web3NameResolver.getDomainName({
        timeout: this.timeout,
        address,
      });
      if (!name) {
        name = await this.solanaNameResolver.getDomainName({
          address,
        });
      }
      return name;
    } catch (error) {
      return null;
    }
  }

  public async resolveAddress(
    name: string,
    paymentIdChain?: string,
  ): Promise<string | null> {
    if (isValidPaymentId(name)) {
      return this.handlePaymentIdGetAddress(name, paymentIdChain);
    }

    const tld = getTLD(name);
    switch (tld) {
      case "sol":
        const solAddress = await this.solanaNameResolver.getAddress({
          name,
        });
        return solAddress;
      default:
        const address = await this.web3NameResolver.getAddress(name, {
          timeout: this.timeout,
        });
        return parseInt(address, 16) === 0 ? null : address;
    }
  }
  public isSupportedName(name: string): boolean {
    // Compatible with TLD  and paymentId
    return this.supportedTLDs.includes(getTLD(name)) || isValidPaymentId(name);
  }
}

export default SIDResolver;
