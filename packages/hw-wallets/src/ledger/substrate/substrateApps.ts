import {
  newAcalaApp,
  newKusamaApp,
  newPolkadotApp,
  newKaruraApp,
} from "@zondax/ledger-substrate";
import type { SubstrateApp } from "@zondax/ledger-substrate";
import type Transport from "@ledgerhq/hw-transport";
import { NetworkNames } from "@enkryptcom/types";

export const LedgerApps: Record<
  string,
  (transport: Transport) => SubstrateApp
> = {
  [NetworkNames.Acala]: newAcalaApp,
  [NetworkNames.Kusama]: newKusamaApp,
  [NetworkNames.Polkadot]: newPolkadotApp,
  [NetworkNames.Karura]: newKaruraApp,
};
