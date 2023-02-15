import { NetworkNames } from "@enkryptcom/types";
import {
  SkaleParams,
  createSkaleEvmNetwork,
  ICustomSKALEAsset,
} from "./skale-base";

export const razorChainID = "0x109b4597";

const skaleRazorOptions: SkaleParams = {
  name: NetworkNames.SkaleRazor,
  name_long: "SKALE | Razor Network",
  chainName: "turbulent-unique-scheat",
  chainID: razorChainID,
};

export const razorAssets: ICustomSKALEAsset[] = [
  {
    name: "Ethereum Clone",
    symbol: "ETHC",
    address: "0xD2Aaa00700000000000000000000000000000000",
    coingeckoID: "ethereum",
    showZero: true,
  },
  {
    address: "0xcbf70914Fae03B3acB91E953De60CfDAaCA8145f",
    coingeckoID: "razor-network",
    showZero: true,
  },
];

const skaleRazor = createSkaleEvmNetwork(skaleRazorOptions, razorAssets);

export default skaleRazor;
