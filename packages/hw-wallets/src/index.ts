import { NetworkNames, HWwalletType } from "@enkryptcom/types";
import LedgerEthereum from "./ledger/ethereum";
import LedgerSubstrate from "./ledger/substrate";
import TrezorEthereum from "./trezor";
import {
  AddressResponse,
  getAddressRequest,
  HWWalletProvider,
  isConnectedRequest,
  PathType,
  SignMessageRequest,
  SignTransactionRequest,
} from "./types";
import { ledgerAppNames } from "./configs";

type ProviderType =
  | typeof LedgerEthereum
  | typeof LedgerSubstrate
  | typeof TrezorEthereum;
class HWwalletManager {
  providerTypes: Record<HWwalletType, ProviderType[]>;

  providers: Record<NetworkNames, HWWalletProvider> | unknown;

  constructor() {
    this.providerTypes = {
      [HWwalletType.ledger]: [LedgerEthereum, LedgerSubstrate],
      [HWwalletType.trezor]: [TrezorEthereum],
    };
    this.providers = {};
  }

  async #initialize(
    wallet: HWwalletType,
    network: NetworkNames
  ): Promise<void> {
    if (!this.providers[network]) {
      this.providers[network] = this.#getProvider(wallet, network);
      await (this.providers[network] as HWWalletProvider).init();
    }
  }

  async getAddress(options: getAddressRequest): Promise<AddressResponse> {
    await this.#initialize(options.wallet, options.networkName);
    return (this.providers[options.networkName] as HWWalletProvider).getAddress(
      options
    );
  }

  async signPersonalMessage(options: SignMessageRequest): Promise<string> {
    await this.#initialize(options.wallet, options.networkName);
    return (
      this.providers[options.networkName] as HWWalletProvider
    ).signPersonalMessage(options);
  }

  async signTransaction(options: SignTransactionRequest): Promise<string> {
    await this.#initialize(options.wallet, options.networkName);
    return (
      this.providers[options.networkName] as HWWalletProvider
    ).signTransaction(options);
  }

  async getSupportedPaths(options: isConnectedRequest): Promise<PathType[]> {
    return this.#getProvider(
      options.wallet,
      options.networkName
    ).getSupportedPaths();
  }

  isNetworkSupported(networkName: NetworkNames): boolean {
    for (const wallet of Object.keys(this.providerTypes)) {
      for (const P of this.providerTypes[wallet]) {
        if (P.getSupportedNetworks().includes(networkName)) return true;
      }
    }
    return false;
  }

  async isConnected(options: isConnectedRequest): Promise<boolean> {
    await this.#initialize(options.wallet, options.networkName);
    return (
      this.providers[options.networkName] as HWWalletProvider
    ).isConnected(options.networkName);
  }

  async close(): Promise<void> {
    return Promise.all(
      Object.values(this.providers).map((p) => (p as HWWalletProvider).close())
    ).then();
  }

  #getProvider(wallet: HWwalletType, network: NetworkNames): HWWalletProvider {
    for (const P of this.providerTypes[wallet]) {
      if (P.getSupportedNetworks().includes(network)) return new P(network);
    }
    throw new Error(`hw-wallets: no suitable wallets found:${network}`);
  }
}

export default HWwalletManager;

export { ledgerAppNames };
