import { NetworkNames } from "@enkryptcom/types";
import { EvmNetwork } from "../../types/evm-network";
import { SkaleParams, createSkaleEvmNetwork } from "./skale-base";

const skaleCryptoColosseumOptions: SkaleParams = {
  name: NetworkNames.SkaleCryptoColosseum,
  name_long: "SKALE | Crytpo Rome",
  chainName: "haunting-devoted-deneb",
  chainID: "0x3d91725c",
};

const skaleCryptoColosseum = new EvmNetwork(
  createSkaleEvmNetwork(skaleCryptoColosseumOptions)
);

export default skaleCryptoColosseum;
