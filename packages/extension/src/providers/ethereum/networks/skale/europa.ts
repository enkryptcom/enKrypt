import { NetworkNames } from "@enkryptcom/types";
import { EvmNetwork } from "../../types/evm-network";
import {
  SkaleParams,
  createSkaleEvmNetwork,
  ICustomSKALEAsset,
} from "./skale-base";

export const europaChainID = "0x79f99296";

const skaleEuropaOptions: SkaleParams = {
  name: NetworkNames.SkaleEuropa,
  name_long: "SKALE | Europa Liquidity Hub",
  chainName: "elated-tan-skat",
  chainID: europaChainID,
};

export const skaleEuropaAssets: ICustomSKALEAsset[] = [
  {
    name: "Ethereum Clone",
    symbol: "ETHC",
    address: "0xD2Aaa00700000000000000000000000000000000",
    coingeckoID: "ethereum",
  },
  {
    address: "0x2B4e4899b53E8b7958c4591a6d02f9C0b5c50F8f",
    coingeckoID: "ruby",
    showZero: true,
  },
  {
    address: "0x73d22d8a2D1f59Bf5Bcf62cA382481a2073FAF58",
    coingeckoID: "paxos-standard",
  },
  {
    address: "0xE0595a049d02b7674572b0d59cd4880Db60EDC50",
    coingeckoID: "skale",
  },
  {
    address: "0x1c0491E3396AD6a35f061c62387a95d7218FC515",
    coingeckoID: "tether",
  },
  {
    address: "0x5F795bb52dAC3085f578f4877D450e2929D2F13d",
    coingeckoID: "usd-coin",
  },
  {
    address: "0xD05C4be5f3be302d376518c9492EC0147Fa5A718",
    coingeckoID: "dai",
  },
  {
    address: "0xcb011E86DF014a46F4e3AC3F3cbB114A4EB80870",
    coingeckoID: "wrapped-bitcoin",
  },
];

const skaleEuropa = new EvmNetwork(createSkaleEvmNetwork(skaleEuropaOptions));

export default skaleEuropa;
