import { NetworkNames } from "@enkryptcom/types";
import { EvmNetwork } from "../../types/evm-network";
import {
  SkaleParams,
  createSkaleEvmNetwork,
  ICustomSKALEAsset,
} from "./skale-base";

export const cryptoBladesChainID = "0x3d28774d";

const skaleCryptoBladesOptions: SkaleParams = {
  name: NetworkNames.SkaleCryptoBlades,
  name_long: "SKALE | CryptoBlades",
  chainName: "affectionate-immediate-pollux",
  chainID: cryptoBladesChainID,
};

export const cryptoBladesAssets: ICustomSKALEAsset[] = [
  {
    name: "Ethereum Clone",
    symbol: "ETHC",
    address: "0xD2Aaa00700000000000000000000000000000000",
    coingeckoID: "ethereum",
  },
];

const skaleCryptoBlades = createSkaleEvmNetwork(skaleCryptoBladesOptions);

export default skaleCryptoBlades;
