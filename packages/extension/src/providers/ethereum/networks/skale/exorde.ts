import { NetworkNames } from "@enkryptcom/types";
import { SkaleParams, createSkaleEvmNetwork } from "./skale-base";

const skaleOptions: SkaleParams = {
  name: NetworkNames.SkaleExorde,
  name_long: "Exorde | SKALE",
  chainName: "light-vast-diphda",
  chainID: "0x7f8cb400",
  icon: "skaleExorde.png",
};

export default createSkaleEvmNetwork(skaleOptions);
