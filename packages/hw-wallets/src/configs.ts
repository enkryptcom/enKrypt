import { HWwalletType, NetworkNames } from "@enkryptcom/types";
import { WalletConfigs } from "./types";

const walletConfigs: WalletConfigs = {
  [HWwalletType.ledger]: {
    isBackground: false,
  },
  [HWwalletType.trezor]: {
    isBackground: true,
  },
};
const ledgerAppNames = {
  [NetworkNames.Ethereum]: "Ethereum",
  [NetworkNames.Matic]: "Ethereum",
  [NetworkNames.Binance]: "Ethereum",
  [NetworkNames.Rootstock]: "RSK",
  [NetworkNames.EthereumClassic]: "Ethereum Classic",
  [NetworkNames.Goerli]: "Ethereum",
  [NetworkNames.Acala]: "Acala",
  [NetworkNames.Kusama]: "Kusama",
  [NetworkNames.Polkadot]: "Polkadot",
  [NetworkNames.Karura]: "Karura",
  [NetworkNames.Edgeware]: "Edgeware",
};
const MessengerName = "enkrypt_hw_wallets";

const bip44Paths = {
  ethereumLedger: {
    path: "m/44'/60'/0'/{index}",
    basePath: "m/44'/60'/0'",
    label: "Ethereum",
  },
  ethereumLedgerLive: {
    path: "m/44'/60'/{index}'/0/0",
    basePath: "m/44'/60'",
    label: "Ethereum - Ledger Live",
  },
  ethereumTestnetLedger: {
    path: "m/44'/1'/0'/{index}",
    basePath: "m/44'/1'/0'",
    label: "Testnet",
  },
  ethereumClassicLedger: {
    path: "m/44'/61'/0'/{index}",
    basePath: "m/44'/61'/0'",
    label: "Ethereum Classic",
  },
  ethereumClassicLedgerLive: {
    path: "m/44'/61'/{index}'/0/0",
    basePath: "m/44'/61'",
    label: "Ethereum Classic -  Ledger Live",
  },
  ethereum: {
    path: "m/44'/60'/0'/0/{index}",
    basePath: "m/44'/60'/0'/0",
    label: "Ethereum",
  },
  rootstock: {
    path: "m/44'/137'/0'/0/{index}",
    basePath: "m/44'/137'/0'/0",
    label: "Rootstock",
  },
  ethereumClassic: {
    path: "m/44'/61'/0'/0/{index}",
    basePath: "m/44'/61'/0'/0",
    label: "Ethereum Classic",
  },
  ethereumTestnet: {
    path: "m/44'/1'/0'/0/{index}",
    basePath: "m/44'/1'/0'/0",
    label: "Testnet",
  },
  substrateLedger: {
    path: "m/0'/0'/{index}'",
    basePath: "m/0'/0'/0",
    label: "Substrate",
  },
};
export { walletConfigs, MessengerName, ledgerAppNames, bip44Paths };
