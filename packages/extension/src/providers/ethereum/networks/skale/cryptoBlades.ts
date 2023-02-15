import { NetworkNames } from "@enkryptcom/types";
import {
  SkaleParams,
  createSkaleEvmNetwork,
  ICustomSKALEAsset,
} from "./skale-base";

const skaleOptions: SkaleParams = {
  name: NetworkNames.SkaleCryptoBlades,
  name_long: "SKALE | CryptoBlades",
  chainName: "affectionate-immediate-pollux",
  chainID: "0x3d28774d",
};

export const assets: ICustomSKALEAsset[] = [
  {
    name: "Ethereum Clone",
    symbol: "ETHC",
    address: "0xD2Aaa00700000000000000000000000000000000",
    coingeckoID: "ethereum",
  },
];

export default createSkaleEvmNetwork(skaleOptions, assets);
