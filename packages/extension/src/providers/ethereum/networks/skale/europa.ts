import { NetworkNames } from "@enkryptcom/types";
import { EvmNetwork } from "../../types/evm-network";
import {
  SkaleParams,
  createSkaleEvmNetwork,
  ICustomSKALEAsset,
} from "./skale-base";

export const europaChainID = "0x79f99296";

const skaleEuropaOptions: SkaleParams = {
  name: NetworkNames.SkaleEuropa,
  name_long: "SKALE | Europa Liquidity Hub",
  chainName: "elated-tan-skat",
  chainID: europaChainID,
};

export const skaleEuropaAssets: ICustomSKALEAsset[] = [
  {
    name: "Ethereum Clone",
    symbol: "ETHC",
    icon: "eth.svg",
    address: "0xD2Aaa00700000000000000000000000000000000",
    coingeckoID: "ethereum",
    showZero: true,
  },
];

const skaleEuropa = new EvmNetwork(createSkaleEvmNetwork(skaleEuropaOptions));

export default skaleEuropa;
