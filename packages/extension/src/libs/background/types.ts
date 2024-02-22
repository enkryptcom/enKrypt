import BitcoinProvider from "@/providers/bitcoin";
import type EthereumProvider from "@/providers/ethereum";
import type PolkadotProvider from "@/providers/polkadot";
import type KadenaProvider from "@/providers/kadena";

export interface TabProviderType {
  [key: string]: Record<
    number,
    EthereumProvider | PolkadotProvider | BitcoinProvider | KadenaProvider
  >;
}
export interface ProviderType {
  [key: string]:
    | typeof EthereumProvider
    | typeof PolkadotProvider
    | typeof BitcoinProvider
    | typeof KadenaProvider;
}
export interface ExternalMessageOptions {
  savePersistentEvents: boolean;
}
