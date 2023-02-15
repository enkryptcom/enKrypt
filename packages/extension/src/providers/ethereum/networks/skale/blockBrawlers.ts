import { NetworkNames } from "@enkryptcom/types";
import {
  SkaleParams,
  createSkaleEvmNetwork,
  ICustomSKALEAsset,
} from "./skale-base";

const skaleOptions: SkaleParams = {
  name: NetworkNames.SkaleBlockBrawlers,
  name_long: "SKALE | BRAWL Chain",
  chainName: "frayed-decent-antares",
  chainID: "0x175b1806",
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