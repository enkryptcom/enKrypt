import { NetworkNames } from "@enkryptcom/types";
import { EvmNetwork } from "../../types/evm-network";
import { SkaleParams, createSkaleEvmNetwork } from "./skale-base";

const skaleEuropaOptions: SkaleParams = {
  name: NetworkNames.SkaleEuropa,
  name_long: "SKALE | Europa Liquidity Hub",
  chainName: "elated-tan-skat",
  chainID: "0x79f99296",
};

const skaleEuropa = new EvmNetwork(createSkaleEvmNetwork(skaleEuropaOptions));

export default skaleEuropa;
