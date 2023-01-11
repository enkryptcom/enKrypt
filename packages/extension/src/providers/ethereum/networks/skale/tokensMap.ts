import { blockBrawlersAssets, blockBrawlersChainID } from "./blockBrawlers";
import { calypsoAssets, calypsoChainID } from "./calypso";
import { cryptoBladesAssets, cryptoBladesChainID } from "./cryptoBlades";
import {
  cryptoColosseumAssets,
  cryptoColosseumChainID,
} from "./cryptoColosseum";
import { europaAssets, europaChainID } from "./europa";
import { exordeAssets, exordeChainID } from "./exorde";
import { nebulaAssets, nebulaChainID } from "./nebula";
import { razorAssets, razorChainID } from "./razor";
import { ICustomSKALEAsset } from "./skale-base";
import { titanAssets, titanChainID } from "./titan";

export default Object.fromEntries(
  new Map<`0x${string}`, ICustomSKALEAsset[]>([
    [blockBrawlersChainID, blockBrawlersAssets],
    [calypsoChainID, calypsoAssets],
    [cryptoBladesChainID, cryptoBladesAssets],
    [cryptoColosseumChainID, cryptoColosseumAssets],
    [europaChainID, europaAssets],
    [exordeChainID, exordeAssets],
    [nebulaChainID, nebulaAssets],
    [razorChainID, razorAssets],
    [titanChainID, titanAssets],
  ])
);
