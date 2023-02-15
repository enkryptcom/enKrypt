import { NetworkNames } from "@enkryptcom/types";
import {
  SkaleParams,
  createSkaleEvmNetwork,
  ICustomSKALEAsset,
} from "./skale-base";

export const titanChainID = "0x507aaa2a";

const skaleTitanOptions: SkaleParams = {
  name: NetworkNames.SkaleTitan,
  name_long: "SKALE | Titan Community Hub",
  chainName: "parallel-stormy-spica",
  chainID: titanChainID,
};

export const titanAssets: ICustomSKALEAsset[] = [
  {
    name: "Ethereum Clone",
    symbol: "ETHC",
    address: "0xD2Aaa00700000000000000000000000000000000",
    coingeckoID: "ethereum",
  },
];

const skaleTitan = createSkaleEvmNetwork(skaleTitanOptions, titanAssets);

export default skaleTitan;
