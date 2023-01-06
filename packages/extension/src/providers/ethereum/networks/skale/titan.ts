import { NetworkNames } from "@enkryptcom/types";
import { EvmNetwork } from "../../types/evm-network";
import { SkaleParams, createSkaleEvmNetwork } from "./skale-base";

const skaleTitanOptions: SkaleParams = {
  name: NetworkNames.SkaleTitan,
  name_long: "Skale (Titan Hub)",
  blockExplorerTX:
    "https://parallel-stormy-spica.explorer.mainnet.skalenodes.com/tx/[[txHash]]",
  blockExplorerAddr:
    "https://parallel-stormy-spica.explorer.mainnet.skalenodes.com/address/[[address]]",
  chainID: "0x507aaa2a",
  node: "wss://mainnet.skalenodes.com/v1/ws/parallel-stormy-spica",
};

const skaleTitan = new EvmNetwork(createSkaleEvmNetwork(skaleTitanOptions));

export default skaleTitan;
