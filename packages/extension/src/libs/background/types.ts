import type EthereumProvider from "@/providers/ethereum";
import type PolkadotProvider from "@/providers/polkadot";

export interface TabProviderType {
  [key: string]: Record<number, EthereumProvider | PolkadotProvider>;
}
export interface ProviderType {
  [key: string]: typeof EthereumProvider | typeof PolkadotProvider;
}
export interface ExternalMessageOptions {
  savePersistentEvents: boolean;
}
