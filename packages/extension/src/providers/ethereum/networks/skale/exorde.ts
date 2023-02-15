import { NetworkNames } from "@enkryptcom/types";
import {
  SkaleParams,
  createSkaleEvmNetwork,
  ICustomSKALEAsset,
} from "./skale-base";

const skaleOptions: SkaleParams = {
  name: NetworkNames.SkaleExorde,
  name_long: "SKALE | Exorde",
  chainName: "light-vast-diphda",
  chainID: "0x7f8cb400",
  icon: "skaleExorde.png",
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
