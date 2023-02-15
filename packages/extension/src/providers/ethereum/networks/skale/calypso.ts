import { NetworkNames } from "@enkryptcom/types";
import {
  SkaleParams,
  createSkaleEvmNetwork,
  ICustomSKALEAsset,
} from "./skale-base";

const skaleOptions: SkaleParams = {
  name: NetworkNames.SkaleCalypso,
  name_long: "SKALE | Calypso NFT Hub",
  chainName: "honorable-steel-rasalhague",
  chainID: "0x5d456c62",
  icon: "skaleCalypsoNFTHub.png",
};

const assets: ICustomSKALEAsset[] = [
  {
    name: "Ethereum Clone",
    symbol: "ETHC",
    address: "0xD2Aaa00700000000000000000000000000000000",
    coingeckoID: "ethereum",
  },
  {
    name: "Europa ETH",
    address: "0x59ab97Ee239e02112652587F9Ef86CB6F762983b",
    coingeckoID: "ethereum",
    showZero: true,
  },
];

export default createSkaleEvmNetwork(skaleOptions, assets);
