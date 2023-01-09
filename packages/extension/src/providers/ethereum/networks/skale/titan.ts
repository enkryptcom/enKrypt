import { NetworkNames } from "@enkryptcom/types";
import { EvmNetwork } from "../../types/evm-network";
import { SkaleParams, createSkaleEvmNetwork } from "./skale-base";

const skaleTitanOptions: SkaleParams = {
  name: NetworkNames.SkaleTitan,
  name_long: "SKALE | Titan Community Hub",
  chainName: "parallel-stormy-spica",
  chainID: "0x507aaa2a",
};

const skaleTitan = new EvmNetwork(createSkaleEvmNetwork(skaleTitanOptions));

export default skaleTitan;
