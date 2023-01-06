import { NetworkNames } from "@enkryptcom/types";
import { EvmNetwork } from "../../types/evm-network";
import { SkaleParams, createSkaleEvmNetwork } from "./skale-base";

const skaleCalypsoOptions: SkaleParams = {
  name: NetworkNames.SkaleCalypso,
  name_long: "Skale (Calypso Hub)",
  blockExplorerTX:
    "https://honorable-steel-rasalhague.explorer.mainnet.skalenodes.com/tx/[[txHash]]",
  blockExplorerAddr:
    "https://honorable-steel-rasalhague.explorer.mainnet.skalenodes.com/address/[[address]]",
  chainID: "0x5d456c62",
  node: "wss://mainnet.skalenodes.com/v1/ws/honorable-steel-rasalhague",
};

const skaleCalypso = new EvmNetwork(createSkaleEvmNetwork(skaleCalypsoOptions));

export default skaleCalypso;
