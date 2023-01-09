import { NetworkNames } from "@enkryptcom/types";
import { EvmNetwork } from "../../types/evm-network";
import { SkaleParams, createSkaleEvmNetwork } from "./skale-base";

const skaleExordeOptions: SkaleParams = {
  name: NetworkNames.SkaleExorde,
  name_long: "SKALE | Exorde",
  chainName: "light-vast-diphda",
  chainID: "0x7f8cb400",
};

const skaleExorde = new EvmNetwork(createSkaleEvmNetwork(skaleExordeOptions));

export default skaleExorde;
