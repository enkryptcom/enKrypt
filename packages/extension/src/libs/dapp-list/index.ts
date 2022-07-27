import { DAppsItem } from "@/types/ui";
import { NetworkNames } from "@enkryptcom/types";
import eth from "./eth";

const lists: Partial<Record<NetworkNames, DAppsItem[]>> = {
  [NetworkNames.Ethereum]: eth,
};

export default lists;
