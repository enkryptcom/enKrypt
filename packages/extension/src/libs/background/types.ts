import BitcoinProvider from "@/providers/bitcoin";
import type EthereumProvider from "@/providers/ethereum";
import type PolkadotProvider from "@/providers/polkadot";

export interface TabProviderType {
  [key: string]: Record<
    number,
    EthereumProvider | PolkadotProvider | BitcoinProvider
  >;
}
export interface ProviderType {
  [key: string]:
    | typeof EthereumProvider
    | typeof PolkadotProvider
    | typeof BitcoinProvider;
}
export interface ExternalMessageOptions {
  savePersistentEvents: boolean;
}
