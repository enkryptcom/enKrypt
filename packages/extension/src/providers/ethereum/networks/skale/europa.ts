import { NetworkNames } from "@enkryptcom/types";
import { EvmNetwork } from "../../types/evm-network";
import { SkaleParams, createSkaleEvmNetwork } from "./skale-base";

const skaleEuropaOptions: SkaleParams = {
  name: NetworkNames.SkaleEuropa,
  name_long: "Skale (Europa Hub)",
  blockExplorerTX:
    "https://elated-tan-skat.explorer.mainnet.skalenodes.com/tx/[[txHash]]",
  blockExplorerAddr:
    "https://elated-tan-skat.explorer.mainnet.skalenodes.com/address/[[address]]",
  chainID: "0x79f99296",
  node: "wss://mainnet.skalenodes.com/v1/ws/elated-tan-skat",
};

const skaleEuropa = new EvmNetwork(createSkaleEvmNetwork(skaleEuropaOptions));

export default skaleEuropa;
