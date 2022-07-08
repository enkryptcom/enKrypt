import { NetworkNames, HWwalletNames } from "@enkryptcom/types";
import LedgerEthereum from "./ledger/ethereum";
import LedgerSubstrate from "./ledger/substrate";
import TrezorEthereum from "./trezor";
import {
  getAddressRequest,
  HWWalletProvider,
  isConnectedRequest,
  PathType,
} from "./types";
import { ledgerAppNames } from "./configs";

type ProviderType =
  | typeof LedgerEthereum
  | typeof LedgerSubstrate
  | typeof TrezorEthereum;
class HWwalletManager {
  providerTypes: Record<HWwalletNames, ProviderType[]>;

  providers: Record<NetworkNames, HWWalletProvider> | unknown;

  constructor() {
    this.providerTypes = {
      [HWwalletNames.ledger]: [LedgerEthereum, LedgerSubstrate],
      [HWwalletNames.trezor]: [TrezorEthereum],
    };
    this.providers = {};
  }

  async #initialize(
    wallet: HWwalletNames,
    network: NetworkNames
  ): Promise<void> {
    if (!this.providers[network]) {
      this.providers[network] = this.#getProvider(wallet, network);
      await (this.providers[network] as HWWalletProvider).init();
    }
  }

  async getAddress(options: getAddressRequest): Promise<string> {
    await this.#initialize(options.wallet, options.networkName);
    return (this.providers[options.networkName] as HWWalletProvider).getAddress(
      options
    );
  }

  async getSupportedPaths(options: isConnectedRequest): Promise<PathType[]> {
    await this.#initialize(options.wallet, options.networkName);
    return (
      this.providers[options.networkName] as HWWalletProvider
    ).getSupportedPaths();
  }

  async isConnected(options: isConnectedRequest): Promise<boolean> {
    await this.#initialize(options.wallet, options.networkName);
    return (
      this.providers[options.networkName] as HWWalletProvider
    ).isConnected(options.networkName);
  }

  #getProvider(wallet: HWwalletNames, network: NetworkNames): HWWalletProvider {
    for (const P of this.providerTypes[wallet]) {
      if (P.getSupportedNetworks().includes(network)) return new P(network);
    }
    throw new Error(`hw-wallets: no suitable wallets found:${network}`);
  }
}

export default HWwalletManager;

export { ledgerAppNames };
