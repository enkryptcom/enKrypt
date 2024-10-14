import { NetworkNames } from "@enkryptcom/types";
import {
  SkaleParams,
  createSkaleEvmNetwork,
  ICustomSKALEAsset,
} from "./skale-base";

const skaleOptions: SkaleParams = {
  name: NetworkNames.SkaleCryptoBlades,
  name_long: "CryptoBlades | SKALE",
  chainName: "affectionate-immediate-pollux",
  chainID: "0x3d28774d",
  icon: "skaleCryptoBlades.png",
};

export const assets: ICustomSKALEAsset[] = [
  {
    name: "Ethereum Clone",
    symbol: "ETHC",
    address: "0xD2Aaa00700000000000000000000000000000000",
    coingeckoID: "ethereum",
  },
  {
    address: "0x5F6E97612482095C0c2C02BC495C0171e61017d7",
    coingeckoID: "cryptoblades",
    showZero: true,
  },
  {
    name: "Europa SKL",
    address: "0x5F6E97612482095C0c2C02BC495C0171e61017d7",
    coingeckoID: "skale",
  },
];

export default createSkaleEvmNetwork(skaleOptions, assets);
