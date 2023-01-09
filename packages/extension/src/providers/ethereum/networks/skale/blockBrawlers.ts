import { NetworkNames } from "@enkryptcom/types";
import { EvmNetwork } from "../../types/evm-network";
import { SkaleParams, createSkaleEvmNetwork } from "./skale-base";

const skaleBlockBrawlersOptions: SkaleParams = {
  name: NetworkNames.SkaleBlockBrawlers,
  name_long: "SKALE | BRAWL Chain",
  chainName: "frayed-decent-antares",
  chainID: "0x175b1806",
};

const skaleBlockBrawlers = new EvmNetwork(
  createSkaleEvmNetwork(skaleBlockBrawlersOptions)
);

export default skaleBlockBrawlers;
