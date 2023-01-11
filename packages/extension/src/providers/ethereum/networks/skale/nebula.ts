import { NetworkNames } from "@enkryptcom/types";
import { EvmNetwork } from "../../types/evm-network";
import {
  SkaleParams,
  createSkaleEvmNetwork,
  ICustomSKALEAsset,
} from "./skale-base";

export const nebulaChainID = "0x585eb4b1";

const skaleNebulaOptions: SkaleParams = {
  name: NetworkNames.SkaleNebula,
  name_long: "SKALE | Nebula Gaming Hub",
  chainName: "green-giddy-denebola",
  chainID: nebulaChainID,
};

export const nebulaAssets: ICustomSKALEAsset[] = [
  {
    name: "Ethereum Clone",
    symbol: "ETHC",
    address: "0xD2Aaa00700000000000000000000000000000000",
    coingeckoID: "ethereum",
  },
];

const skaleNebula = new EvmNetwork(createSkaleEvmNetwork(skaleNebulaOptions));

export default skaleNebula;
