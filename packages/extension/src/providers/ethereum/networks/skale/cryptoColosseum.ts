import { NetworkNames } from "@enkryptcom/types";
import { EvmNetwork } from "../../types/evm-network";
import { SkaleParams, createSkaleEvmNetwork } from "./skale-base";

const skaleCryptoColosseumOptions: SkaleParams = {
  name: NetworkNames.SkaleCryptoColosseum,
  name_long: "Skale (CryptoColosseum)",
  blockExplorerTX:
    "https://haunting-devoted-deneb.explorer.mainnet.skalenodes.com/tx/[[txHash]]",
  blockExplorerAddr:
    "https://haunting-devoted-deneb.explorer.mainnet.skalenodes.com/address/[[address]]",
  chainID: "0x3d91725c",
  node: "wss://mainnet.skalenodes.com/v1/ws/haunting-devoted-deneb",
};

const skaleCryptoColosseum = new EvmNetwork(
  createSkaleEvmNetwork(skaleCryptoColosseumOptions)
);

export default skaleCryptoColosseum;
