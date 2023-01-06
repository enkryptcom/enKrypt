import { NetworkNames } from "@enkryptcom/types";
import { EvmNetwork } from "../../types/evm-network";
import { SkaleParams, createSkaleEvmNetwork } from "./skale-base";

const skaleCryptoBladesOptions: SkaleParams = {
  name: NetworkNames.SkaleCryptoBlades,
  name_long: "Skale (CryptoBlades)",
  blockExplorerTX:
    "https://affectionate-immediate-pollux.explorer.mainnet.skalenodes.com/tx/[[txHash]]",
  blockExplorerAddr:
    "https://affectionate-immediate-pollux.explorer.mainnet.skalenodes.com/address/[[address]]",
  chainID: "0x3d28774d",
  node: "wss://mainnet.skalenodes.com/v1/ws/affectionate-immediate-pollux",
};

const skaleCryptoBlades = new EvmNetwork(
  createSkaleEvmNetwork(skaleCryptoBladesOptions)
);

export default skaleCryptoBlades;
