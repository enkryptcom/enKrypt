import { NetworkNames } from "@enkryptcom/types";
import {
  SkaleParams,
  createSkaleEvmNetwork,
  ICustomSKALEAsset,
} from "./skale-base";

export const exordeChainID = "0x7f8cb400";

const skaleExordeOptions: SkaleParams = {
  name: NetworkNames.SkaleExorde,
  name_long: "SKALE | Exorde",
  chainName: "light-vast-diphda",
  chainID: exordeChainID,
};

export const exordeAssets: ICustomSKALEAsset[] = [
  {
    name: "Ethereum Clone",
    symbol: "ETHC",
    address: "0xD2Aaa00700000000000000000000000000000000",
    coingeckoID: "ethereum",
  },
];

const skaleExorde = createSkaleEvmNetwork(skaleExordeOptions, exordeAssets);

export default skaleExorde;
