import { NetworkNames } from "@enkryptcom/types";
import { EvmNetwork } from "../../types/evm-network";
import { SkaleParams, createSkaleEvmNetwork } from "./skale-base";

const skaleCalypsoOptions: SkaleParams = {
  name: NetworkNames.SkaleCalypso,
  name_long: "SKALE | Calypso NFT Hub",
  chainName: "honorable-steel-rasalhague",
  chainID: "0x5d456c62",
  icon: "skaleCalypsoNFTHub.png",
};

const skaleCalypso = new EvmNetwork(createSkaleEvmNetwork(skaleCalypsoOptions));

export default skaleCalypso;
