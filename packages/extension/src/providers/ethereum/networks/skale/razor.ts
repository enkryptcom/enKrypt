import { NetworkNames } from "@enkryptcom/types";
import { EvmNetwork } from "../../types/evm-network";
import { SkaleParams, createSkaleEvmNetwork } from "./skale-base";

const skaleRazorOptions: SkaleParams = {
  name: NetworkNames.SkaleRazor,
  name_long: "SKALE | Razor Network",
  chainName: "turbulent-unique-scheat",
  chainID: "0x109b4597",
};

const skaleRazor = new EvmNetwork(createSkaleEvmNetwork(skaleRazorOptions));

export default skaleRazor;
