import { NetworkNames } from "@enkryptcom/types";
import { SkaleParams, createSkaleEvmNetwork } from "./skale-base";

const skaleOptions: SkaleParams = {
  name: NetworkNames.SkaleNebula,
  name_long: "Nebula Gaming Hub | SKALE",
  chainName: "green-giddy-denebola",
  chainID: "0x585eb4b1",
  icon: "skaleNebula.png",
};

export default createSkaleEvmNetwork(skaleOptions);
