import { DAppsItem } from "@/types/ui";
import { NetworkNames } from "@enkryptcom/types";
import eth from "./eth";
import binance from "./bsc";
import matic from "./matic";
import etc from "./etc";

const lists: Partial<Record<NetworkNames, DAppsItem[]>> = {
  [NetworkNames.Ethereum]: eth,
  [NetworkNames.Binance]: binance,
  [NetworkNames.Matic]: matic,
  [NetworkNames.EthereumClassic]: etc,
};

export default lists;
