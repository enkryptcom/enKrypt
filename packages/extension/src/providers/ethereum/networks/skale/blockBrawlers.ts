import { NetworkNames } from "@enkryptcom/types";
import { EvmNetwork } from "../../types/evm-network";
import {
  SkaleParams,
  createSkaleEvmNetwork,
  ICustomSKALEAsset,
} from "./skale-base";

export const blockBrawlersChainID = "0x175b1806";

const skaleBlockBrawlersOptions: SkaleParams = {
  name: NetworkNames.SkaleBlockBrawlers,
  name_long: "SKALE | BRAWL Chain",
  chainName: "frayed-decent-antares",
  chainID: blockBrawlersChainID,
};

export const blockBrawlersAssets: ICustomSKALEAsset[] = [
  {
    name: "Ethereum Clone",
    symbol: "ETHC",
    address: "0xD2Aaa00700000000000000000000000000000000",
    coingeckoID: "ethereum",
  },
];

const skaleBlockBrawlers = new EvmNetwork(
  createSkaleEvmNetwork(skaleBlockBrawlersOptions)
);

export default skaleBlockBrawlers;
