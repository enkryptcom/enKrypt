import { DAppsItem } from "@/types/ui";
import { NetworkNames } from "@enkryptcom/types";
import eth from "./eth";
import binance from "./bsc";
import matic from "./matic";
import etc from "./etc";
import ksm from "./ksm";
import dot from "./dot";
import aca from "./aca";
import kar from "./kar";
import glmr from "./glmr";
import movr from "./movr";

const lists: Partial<Record<NetworkNames, DAppsItem[]>> = {
  [NetworkNames.Ethereum]: eth,
  [NetworkNames.Binance]: binance,
  [NetworkNames.Matic]: matic,
  [NetworkNames.EthereumClassic]: etc,
  [NetworkNames.Kusama]: ksm,
  [NetworkNames.Polkadot]: dot,
  [NetworkNames.Acala]: aca,
  [NetworkNames.Karura]: kar,
  [NetworkNames.Moonbeam]: glmr,
  [NetworkNames.Moonriver]: movr,
};

export default lists;
