import { NetworkNames } from "@enkryptcom/types";
import {
  SkaleParams,
  createSkaleEvmNetwork,
  ICustomSKALEAsset,
} from "./skale-base";

const skaleOptions: SkaleParams = {
  name: NetworkNames.SkaleTitan,
  name_long: "SKALE | Titan Community Hub",
  chainName: "parallel-stormy-spica",
  chainID: "0x507aaa2a",
  icon: "skaleTitan.png",
};

export default createSkaleEvmNetwork(skaleOptions);
