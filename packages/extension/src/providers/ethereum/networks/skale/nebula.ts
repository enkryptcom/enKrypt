import { NetworkNames } from "@enkryptcom/types";
import { EvmNetwork } from "../../types/evm-network";
import { SkaleParams, createSkaleEvmNetwork } from "./skale-base";

const skaleNebulaOptions: SkaleParams = {
  name: NetworkNames.SkaleNebula,
  name_long: "SKALE | Nebula Gaming Hub",
  chainName: "green-giddy-denebola",
  chainID: "0x585eb4b1",
};

const skaleNebula = new EvmNetwork(createSkaleEvmNetwork(skaleNebulaOptions));

export default skaleNebula;
