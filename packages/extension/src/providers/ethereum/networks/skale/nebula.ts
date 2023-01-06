import { NetworkNames } from "@enkryptcom/types";
import { EvmNetwork } from "../../types/evm-network";
import { SkaleParams, createSkaleEvmNetwork } from "./skale-base";

const skaleNebulaOptions: SkaleParams = {
  name: NetworkNames.SkaleNebula,
  name_long: "Skale (Nebula Gaming Hub)",
  blockExplorerTX:
    "https://green-giddy-denebola.explorer.mainnet.skalenodes.com/tx/[[txHash]]",
  blockExplorerAddr:
    "https://green-giddy-denebola.explorer.mainnet.skalenodes.com/address/[[address]]",
  chainID: "0x585eb4b1",
  node: "wss://mainnet.skalenodes.com/v1/ws/green-giddy-denebola",
};

const skaleNebula = new EvmNetwork(createSkaleEvmNetwork(skaleNebulaOptions));

export default skaleNebula;
