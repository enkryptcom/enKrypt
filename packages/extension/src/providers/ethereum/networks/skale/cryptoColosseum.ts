import { NetworkNames } from "@enkryptcom/types";
import {
  SkaleParams,
  createSkaleEvmNetwork,
  ICustomSKALEAsset,
} from "./skale-base";

export const cryptoColosseumChainID = "0x3d91725c";

const skaleCryptoColosseumOptions: SkaleParams = {
  name: NetworkNames.SkaleCryptoColosseum,
  name_long: "SKALE | Crytpo Rome",
  chainName: "haunting-devoted-deneb",
  chainID: cryptoColosseumChainID,
};

export const cryptoColosseumAssets: ICustomSKALEAsset[] = [
  {
    name: "Ethereum Clone",
    symbol: "ETHC",
    address: "0xD2Aaa00700000000000000000000000000000000",
    coingeckoID: "ethereum",
  },
];

const skaleCryptoColosseum = createSkaleEvmNetwork(
  skaleCryptoColosseumOptions,
  cryptoColosseumAssets
);

export default skaleCryptoColosseum;
