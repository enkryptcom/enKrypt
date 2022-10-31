import { NetworkNames } from "@enkryptcom/types";

const lists: Partial<Record<NetworkNames, string>> = {
  [NetworkNames.Ethereum]:
    "https://github.com/enkryptcom/dynamic-data/raw/main/dapps/eth.json",
  [NetworkNames.Binance]:
    "https://github.com/enkryptcom/dynamic-data/raw/main/dapps/bsc.json",
  [NetworkNames.Matic]:
    "https://github.com/enkryptcom/dynamic-data/raw/main/dapps/matic.json",
  [NetworkNames.EthereumClassic]:
    "https://github.com/enkryptcom/dynamic-data/raw/main/dapps/etc.json",
  [NetworkNames.Kusama]:
    "https://github.com/enkryptcom/dynamic-data/raw/main/dapps/ksm.json",
  [NetworkNames.Polkadot]:
    "https://github.com/enkryptcom/dynamic-data/raw/main/dapps/dot.json",
  [NetworkNames.Acala]:
    "https://raw.githubusercontent.com/enkryptcom/dynamic-data/main/dapps/aca.json",
  [NetworkNames.Karura]:
    "https://github.com/enkryptcom/dynamic-data/raw/main/dapps/kar.json",
  [NetworkNames.Moonbeam]:
    "https://github.com/enkryptcom/dynamic-data/raw/main/dapps/glmr.json",
  [NetworkNames.Moonriver]:
    "https://github.com/enkryptcom/dynamic-data/raw/main/dapps/movr.json",
  [NetworkNames.Astar]:
    "https://github.com/enkryptcom/dynamic-data/raw/main/dapps/astr.json",
  [NetworkNames.AstarEVM]:
    "https://github.com/enkryptcom/dynamic-data/raw/main/dapps/astr.json",
  [NetworkNames.Shiden]:
    "https://github.com/enkryptcom/dynamic-data/raw/main/dapps/sdn.json",
  [NetworkNames.ShidenEVM]:
    "https://github.com/enkryptcom/dynamic-data/raw/main/dapps/sdn.json",
  [NetworkNames.Okc]:
    "https://github.com/enkryptcom/dynamic-data/raw/main/dapps/okc.json",
  [NetworkNames.Canto]:
    "https://github.com/enkryptcom/dynamic-data/raw/main/dapps/canto.json",
  [NetworkNames.Bifrost]:
    "https://github.com/enkryptcom/dynamic-data/raw/main/dapps/bifrost.json",
  [NetworkNames.BifrostKusama]:
    "https://github.com/enkryptcom/dynamic-data/raw/main/dapps/bifrost.json",
};

export default lists;
