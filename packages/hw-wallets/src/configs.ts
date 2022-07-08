import { HWwalletNames, NetworkNames } from "@enkryptcom/types";
import { WalletConfigs } from "./types";

const walletConfigs: WalletConfigs = {
  [HWwalletNames.ledger]: {
    isBackground: false,
  },
  [HWwalletNames.trezor]: {
    isBackground: true,
  },
};
const ledgerAppNames = {
  [NetworkNames.Ethereum]: "Ethereum",
  [NetworkNames.Matic]: "Polygon",
  [NetworkNames.EthereumClassic]: "Ethereum Classic",
  [NetworkNames.Ropsten]: "Ethereum",
  [NetworkNames.Goerli]: "Ethereum",
  [NetworkNames.Acala]: "Acala",
  [NetworkNames.Kusama]: "Kusama",
  [NetworkNames.Polkadot]: "Polkadot",
  [NetworkNames.Karura]: "Karura",
};
const MessengerName = "enkrypt_hw_wallets";

const bip44Paths = {
  ethereum: {
    path: "m/44'/60'/0'/{index}",
    label: "Ethereum",
  },
  ledgerLiveEthereum: {
    path: "m/44'/60'/{index}'/0/0",
    label: "Ethereum - Ledger Live",
  },
  ethereumClassic: {
    path: "m/44'/60'/160720'/0'/{index}",
    label: "Ethereum Classic",
  },
  ethereumClassicLedgerLive: {
    path: "m/44'/61'/{index}'/0/0",
    label: "Ethereum Classic -  Ledger Live",
  },
  ethereumTestnets: {
    path: "m/44'/1'/0'/0/{index}",
    label: "Testnet",
  },
  substrateLedger: {
    path: "m/0'/0'/{index}'",
    label: "Substrate",
  },
};
export { walletConfigs, MessengerName, ledgerAppNames, bip44Paths };
