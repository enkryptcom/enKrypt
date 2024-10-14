import { NetworkNames } from "@enkryptcom/types";
import { SkaleParams, createSkaleEvmNetwork } from "./skale-base";

const skaleOptions: SkaleParams = {
  name: NetworkNames.SkaleTitan,
  name_long: "Titan Community Hub | SKALE",
  chainName: "parallel-stormy-spica",
  chainID: "0x507aaa2a",
  icon: "skaleTitan.png",
};

export default createSkaleEvmNetwork(skaleOptions);
