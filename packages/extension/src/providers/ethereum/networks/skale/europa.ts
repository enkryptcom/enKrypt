import { NetworkNames } from "@enkryptcom/types";
import {
  SkaleParams,
  createSkaleEvmNetwork,
  ICustomSKALEAsset,
} from "./skale-base";

const skaleOptions: SkaleParams = {
  name: NetworkNames.SkaleEuropa,
  name_long: "Europa Liquidity Hub | SKALE",
  chainName: "elated-tan-skat",
  chainID: "0x79f99296",
  icon: "skaleEuropa.svg",
};

const assets: ICustomSKALEAsset[] = [
  {
    name: "Ethereum Clone",
    symbol: "ETHC",
    address: "0xD2Aaa00700000000000000000000000000000000",
    coingeckoID: "ethereum",
    showZero: true,
  },
  {
    address: "0x2B4e4899b53E8b7958c4591a6d02f9C0b5c50F8f",
    coingeckoID: "ruby",
    showZero: true,
  },
  {
    address: "0x73d22d8a2D1f59Bf5Bcf62cA382481a2073FAF58",
    coingeckoID: "paxos-standard",
    showZero: true,
  },
  {
    address: "0xE0595a049d02b7674572b0d59cd4880Db60EDC50",
    coingeckoID: "skale",
    showZero: true,
  },
  {
    address: "0x1c0491E3396AD6a35f061c62387a95d7218FC515",
    coingeckoID: "tether",
    showZero: true,
  },
  {
    address: "0x5F795bb52dAC3085f578f4877D450e2929D2F13d",
    coingeckoID: "usd-coin",
    showZero: true,
  },
  {
    address: "0xD05C4be5f3be302d376518c9492EC0147Fa5A718",
    coingeckoID: "dai",
  },
  {
    address: "0xcb011E86DF014a46F4e3AC3F3cbB114A4EB80870",
    coingeckoID: "wrapped-bitcoin",
  },
  {
    address: "0xBDDad45160E10C3738785d9dD7F30b4B2a5Eeba8",
    coingeckoID: "cryptoblades",
  },
  {
    name: "Europa Wrapped ETHC",
    symbol: "wETHC",
    address: "0xa5274efA35EbeFF47C1510529D9a8812F95F5735",
    coingeckoID: "ethereum",
  },
  {
    name: "Europa Wrapped SKL",
    symbol: "wSKL",
    address: "0xD162bB5c75FE99144295b03510bAb2DF99617440",
    coingeckoID: "skale",
  },
  {
    address: "0xBE3530a3eDf9472693065041B8c9155C7FeCB8e5",
    coingeckoID: "human-protocol",
  },
  {
    name: "Europa Wrapped HMT",
    symbol: "wHMT",
    address: "0x06104018340BB547803F5410174d9B68475e6769",
    coingeckoID: "human-protocol",
  },
];

export default createSkaleEvmNetwork(skaleOptions, assets);
