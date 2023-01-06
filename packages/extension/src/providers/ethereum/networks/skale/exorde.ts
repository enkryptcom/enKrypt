import { NetworkNames } from "@enkryptcom/types";
import { EvmNetwork } from "../../types/evm-network";
import { SkaleParams, createSkaleEvmNetwork } from "./skale-base";

const skaleExordeOptions: SkaleParams = {
  name: NetworkNames.SkaleExorde,
  name_long: "Skale (Exorde)",
  blockExplorerTX:
    "https://light-vast-diphda.explorer.mainnet.skalenodes.com/tx/[[txHash]]",
  blockExplorerAddr:
    "https://light-vast-diphda.explorer.mainnet.skalenodes.com/address/[[address]]",
  chainID: "0x7f8cb400",
  node: "wss://mainnet.skalenodes.com/v1/ws/light-vast-diphda",
};

const skaleExorde = new EvmNetwork(createSkaleEvmNetwork(skaleExordeOptions));

export default skaleExorde;
