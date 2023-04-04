import { NetworkNames } from "@enkryptcom/types";
import {
  SkaleParams,
  createSkaleEvmNetwork,
  ICustomSKALEAsset,
} from "./skale-base";

const skaleOptions: SkaleParams = {
  name: NetworkNames.SkaleCalypso,
  name_long: "Calypso NFT Hub | SKALE",
  chainName: "honorable-steel-rasalhague",
  chainID: "0x5d456c62",
  icon: "skaleCalypsoNFTHub.png",
};

const assets: ICustomSKALEAsset[] = [
  {
    name: "Europa ETH",
    address: "0x59ab97Ee239e02112652587F9Ef86CB6F762983b",
    coingeckoID: "ethereum",
    showZero: true,
  },
];

export default createSkaleEvmNetwork(skaleOptions, assets);
