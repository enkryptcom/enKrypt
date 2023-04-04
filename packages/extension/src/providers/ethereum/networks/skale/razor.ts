import { NetworkNames } from "@enkryptcom/types";
import {
  SkaleParams,
  createSkaleEvmNetwork,
  ICustomSKALEAsset,
} from "./skale-base";

const skaleOptions: SkaleParams = {
  name: NetworkNames.SkaleRazor,
  name_long: "Razor Network | SKALE",
  chainName: "turbulent-unique-scheat",
  chainID: "0x109b4597",
  icon: "skaleRazor.png",
};

const assets: ICustomSKALEAsset[] = [
  {
    name: "Ethereum Clone",
    symbol: "ETHC",
    address: "0xD2Aaa00700000000000000000000000000000000",
    coingeckoID: "ethereum",
  },
  {
    address: "0xcbf70914Fae03B3acB91E953De60CfDAaCA8145f",
    coingeckoID: "razor-network",
    showZero: true,
  },
];

export default createSkaleEvmNetwork(skaleOptions, assets);
