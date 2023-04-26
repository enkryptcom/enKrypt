// SFUEL is different - need a custom solution

import { NetworkNames } from "@enkryptcom/types";
import {
  SkaleParams,
  createSkaleEvmNetwork,
  ICustomSKALEAsset,
} from "./skale-base";

const skaleOptions: SkaleParams = {
  name: NetworkNames.SkaleBlockBrawlers,
  name_long: "BRAWL Chain | SKALE",
  chainName: "frayed-decent-antares",
  chainID: "0x175b1806",
  icon: "skaleBlockBrawlers.png",
  currencyName: "BRAWL",
  currencyNameLong: "BRAWL",
};

const assets: ICustomSKALEAsset[] = [
  {
    name: "Ethereum Clone",
    symbol: "ETHC",
    address: "0xD2Aaa00700000000000000000000000000000000",
    coingeckoID: "ethereum",
  },
];

export default createSkaleEvmNetwork(skaleOptions, assets);
