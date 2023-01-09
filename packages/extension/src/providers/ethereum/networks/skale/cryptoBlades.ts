import { NetworkNames } from "@enkryptcom/types";
import { EvmNetwork } from "../../types/evm-network";
import { SkaleParams, createSkaleEvmNetwork } from "./skale-base";

const skaleCryptoBladesOptions: SkaleParams = {
  name: NetworkNames.SkaleCryptoBlades,
  name_long: "SKALE | CryptoBlades",
  chainName: "affectionate-immediate-pollux",
  chainID: "0x3d28774d",
};

const skaleCryptoBlades = new EvmNetwork(
  createSkaleEvmNetwork(skaleCryptoBladesOptions)
);

export default skaleCryptoBlades;
