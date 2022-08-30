const reg = /^[.a-z0-9-]+$/;
import { NetworkNames } from "@enkryptcom/types";
import { default as Resolution } from "@unstoppabledomains/resolution";
const resolution = new Resolution();

const resolutionService = "https://unstoppabledomains.g.alchemy.com/domains/";
const tldAPI = "https://resolve.unstoppabledomains.com/supported_tlds";
const alchemyKey = "bKmEKAC4HJUEDNlnoYITvXYuhrIshFsa";

const maticNativeKey = "crypto.MATIC.version.MATIC.address";
import { isAddress } from "web3-utils";

export class UNSResolver {
  supportedTlds: string[] = [];
  domainData = new Map();
  reverseDomains = new Map<string, string>();

  networkToChainId(network: NetworkNames): string | null {
    switch (network) {
      case NetworkNames.Binance:
        return "BEP20";
      case NetworkNames.Matic:
        return "MATIC";
      case NetworkNames.Ethereum:
        return "ETH";
    }
    return null;
  }
  async lookupDomain(address: string): Promise<string | null> {
    try {
      const domain = this.preparedDomain(address);

      if (domain !== "" && (await this.isValidTLD(domain))) {
        const response = await fetch(resolutionService + domain, {
          method: "get",
          headers: new Headers({
            Authorization: "Bearer " + alchemyKey,
          }),
        });
        const data = await response.json();
        if (data.records) {
          this.domainData.set(domain, data.records);

          return data.records;
        }
        return null;
      }
      return null;
    } catch (e) {
      return null;
    }
  }

  async reverseUNS(address: string): Promise<string | null> {
    try {
      const storedDmoain = this.reverseDomains.get(address);

      if (storedDmoain) {
        return storedDmoain;
      }
      const domain = await resolution.reverse(address);
      if (domain) {
        this.reverseDomains.set(address, domain);
      }
      return domain;
    } catch (e) {
      return null;
    }
  }

  getDomain(
    address: string,
    ticker: string,
    nativeCurrency: string,
    network: NetworkNames
  ): string | null {
    const key = this.getUNSKey(ticker, nativeCurrency, network);
    const domainWithTicker = this.domainData.get(address)?.[key];
    return domainWithTicker;
  }

  getDomainPolkadot(address: string): string | null {
    const key = this.getUNSKey("DOT", "DOT", NetworkNames.Polkadot);
    const domainWithTicker = this.domainData.get(address)?.[key];
    return domainWithTicker;
  }

  isValidAddress(
    address: string,
    ticker: string,
    nativeCurrency: string,
    network: NetworkNames
  ): boolean {
    return (
      isAddress(address) ||
      !!this.getDomain(address, ticker, nativeCurrency, network)
    );
  }

  isValidDomain(
    address: string,
    ticker: string,
    nativeCurrency: string,
    network: NetworkNames
  ): boolean {
    return !!this.getDomain(address, ticker, nativeCurrency, network);
  }

  isValidDomainPolkadot(address: string): boolean {
    return !!this.getDomainPolkadot(address);
  }

  async isValidTLD(domain: string): Promise<boolean> {
    if (this.supportedTlds.length === 0) {
      const response = await fetch(tldAPI);
      const data = await response.json();
      if (data.tlds) {
        this.supportedTlds = data.tlds;
      }
    }
    return this.supportedTlds?.some((tld) => domain.endsWith(tld)) ?? false;
  }

  preparedDomain(domain: string): string {
    const retVal = domain ? domain.trim().toLowerCase() : "";
    if (reg.test(retVal)) {
      return retVal;
    }
    return "";
  }

  getUNSKey(
    ticker: string,
    nativeCurrency: string,
    network: NetworkNames
  ): string {
    const chainId = this.networkToChainId(network);
    if (!ticker) {
      return "";
    }
    const tickerMain = ticker.toUpperCase();
    const isNative = tickerMain === nativeCurrency.toUpperCase();
    if (isNative) {
      if (network === NetworkNames.Matic) {
        return maticNativeKey;
      }
      return "crypto." + network + ".address";
    }
    if (chainId) {
      return `crypto.${tickerMain}.version.${chainId}.address`;
    } else {
      return "crypto." + network + ".address";
    }
  }
}
