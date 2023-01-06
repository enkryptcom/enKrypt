import { NetworkNames } from "@enkryptcom/types";
import { EvmNetwork } from "../../types/evm-network";
import { SkaleParams, createSkaleEvmNetwork } from "./skale-base";

const skaleRazorOptions: SkaleParams = {
  name: NetworkNames.SkaleRazor,
  name_long: "Skale (Razor)",
  blockExplorerTX:
    "https://turbulent-unique-scheat.explorer.mainnet.skalenodes.com/tx/[[txHash]]",
  blockExplorerAddr:
    "https://turbulent-unique-scheat.explorer.mainnet.skalenodes.com/address/[[address]]",
  chainID: "0x109b4597",
  node: "wss://mainnet.skalenodes.com/v1/ws/turbulent-unique-scheat",
};

const skaleRazor = new EvmNetwork(createSkaleEvmNetwork(skaleRazorOptions));

export default skaleRazor;
