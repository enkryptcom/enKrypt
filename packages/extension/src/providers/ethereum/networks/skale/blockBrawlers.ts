import { NetworkNames } from "@enkryptcom/types";
import { EvmNetwork } from "../../types/evm-network";
import { SkaleParams, createSkaleEvmNetwork } from "./skale-base";

const skaleBlockBrawlersOptions: SkaleParams = {
  name: NetworkNames.SkaleBlockBrawlers,
  name_long: "Skale (BlockBrawlers)",
  blockExplorerTX:
    "https://frayed-decent-antares.explorer.mainnet.skalenodes.com/tx/[[txHash]]",
  blockExplorerAddr:
    "https://frayed-decent-antares.explorer.mainnet.skalenodes.com/address/[[address]]",
  chainID: "0x175b1806",
  node: "wss://mainnet.skalenodes.com/v1/ws/frayed-decent-antares",
};

const skaleBlockBrawlers = new EvmNetwork(
  createSkaleEvmNetwork(skaleBlockBrawlersOptions)
);

export default skaleBlockBrawlers;
