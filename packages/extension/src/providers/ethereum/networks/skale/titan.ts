import { NetworkNames } from "@enkryptcom/types";
import { EvmNetwork } from "../../types/evm-network";
import {
  SkaleParams,
  createSkaleEvmNetwork,
  ICustomSKALEAsset,
} from "./skale-base";

export const titanChainID = "0x507aaa2a";

const skaleTitanOptions: SkaleParams = {
  name: NetworkNames.SkaleTitan,
  name_long: "SKALE | Titan Community Hub",
  chainName: "parallel-stormy-spica",
  chainID: "0x507aaa2a",
};

export const titanAssets: ICustomSKALEAsset[] = [
  {
    name: "Ethereum Clone",
    symbol: "ETHC",
    address: "0xD2Aaa00700000000000000000000000000000000",
    coingeckoID: "ethereum",
  },
];

const skaleTitan = new EvmNetwork(createSkaleEvmNetwork(skaleTitanOptions));

export default skaleTitan;
