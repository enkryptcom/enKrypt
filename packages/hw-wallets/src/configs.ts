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
  [NetworkNames.Rootstock]: "RSK",
  [NetworkNames.EthereumClassic]: "Ethereum Classic",
  [NetworkNames.Acala]: "Acala",
  [NetworkNames.Kusama]: "Kusama",
  [NetworkNames.Polkadot]: "Polkadot",
  [NetworkNames.Karura]: "Karura",
  [NetworkNames.Edgeware]: "Edgeware",
  [NetworkNames.Bitcoin]: "Bitcoin",
  [NetworkNames.BitcoinTest]: "Bitcoin Test",
  [NetworkNames.Litecoin]: "Litecoin",
  [NetworkNames.Dogecoin]: "Dogecoin",
  [NetworkNames.Solana]: "Solana",
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
  rootstockTestnet: {
    path: "m/44'/37310'/0'/0/{index}",
    basePath: "m/44'/37310'/0'/0",
    label: 'Rootstock Testnet'
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
  bitcoinSegwitLedger: {
    path: "m/84'/0'/{index}'/0/0",
    basePath: "m/84'/0'",
    label: "Bitcoin",
  },
  bitcoinTestSegwitLedger: {
    path: "m/84'/1'/{index}'/0/0",
    basePath: "m/84'/1'",
    label: "Bitcoin Test",
  },
  litecoinSegwitLedger: {
    path: "m/84'/2'/{index}'/0/0",
    basePath: "m/84'/2'",
    label: "Litecoin",
  },
  dogecoinLedger: {
    path: "m/44'/3'/{index}'/0/0",
    basePath: "m/44'/3'",
    label: "Dogecoin",
  },
  solanaLedger: {
    path: "44'/501'/{index}'",
    basePath: "44'/501'",
    label: "Solana",
  },
  solanaTrezor: {
    path: "m/44'/501'/{index}'/0'",
    basePath: "m/44'/501'",
    label: "Solana",
  },
  bitcoinSegwitTrezor: {
    path: "m/84'/0'/0'/0/{index}",
    basePath: "m/84'/0'/0'/0",
    label: "Bitcoin",
  },
  litecoinSegwitTrezor: {
    path: "m/84'/2'/0'/0/{index}",
    basePath: "m/84'/2'/0'/0",
    label: "Litecoin",
  },
  dogecoinTrezor: {
    path: "m/44'/3'/0'/0/{index}",
    basePath: "m/44'/3'/0'/0",
    label: "Dogecoin",
  },
  // Additional paths from MyEtherWallet
  poaNetwork: {
    path: "m/44'/60'/0'/0/{index}",
    basePath: "m/44'/60'/0'/0",
    label: 'POA network'
  },
  expanse: {
    path: "m/44'/40'/0'/0/{index}",
    basePath: "m/44'/40'/0'/0",
    label: 'Expanse'
  },
  ubiq: {
    path: "m/44'/108'/0'/0/{index}",
    basePath: "m/44'/108'/0'/0",
    label: 'Ubiq'
  },
  ellaism: {
    path: "m/44'/163'/0'/0/{index}",
    basePath: "m/44'/163'/0'/0",
    label: 'Ellaism'
  },
  etherGem: {
    path: "m/44'/1987'/0'/0/{index}",
    basePath: "m/44'/1987'/0'/0",
    label: 'EtherGem'
  },
  callisto: {
    path: "m/44'/820'/0'/0/{index}",
    basePath: "m/44'/820'/0'/0",
    label: 'Callisto'
  },
  ethereumSocial: {
    path: "m/44'/1128'/0'/0/{index}",
    basePath: "m/44'/1128'/0'/0",
    label: 'Ethereum Social'
  },
  musicoin: {
    path: "m/44'/184'/0'/0/{index}",
    basePath: "m/44'/184'/0'/0",
    label: 'Musicoin'
  },
  goChain: {
    path: "m/44'/6060'/0'/0/{index}",
    basePath: "m/44'/6060'/0'/0",
    label: 'GoChain'
  },
  eosClassic: {
    path: "m/44'/2018'/0'/0/{index}",
    basePath: "m/44'/2018'/0'/0",
    label: 'EOS Classic'
  },
  akroma: {
    path: "m/44'/200625'/0'/0/{index}",
    basePath: "m/44'/200625'/0'/0",
    label: 'Akroma'
  },
  etherSocialNetwork: {
    path: "m/44'/31102'/0'/0/{index}",
    basePath: "m/44'/31102'/0'/0",
    label: 'EtherSocial Network'
  },
  pirl: {
    path: "m/44'/164'/0'/0/{index}",
    basePath: "m/44'/164'/0'/0",
    label: 'PIRL'
  },
  ether1: {
    path: "m/44'/1313114'/0'/0/{index}",
    basePath: "m/44'/1313114'/0'/0",
    label: 'Ether-1'
  },
  atheios: {
    path: "m/44'/1620'/0'/0/{index}",
    basePath: "m/44'/1620'/0'/0",
    label: 'Atheios'
  },
  tomoChain: {
    path: "m/44'/889'/0'/0/{index}",
    basePath: "m/44'/889'/0'/0",
    label: 'TomoChain'
  },
  mixBlockchain: {
    path: "m/44'/76'/0'/0/{index}",
    basePath: "m/44'/76'/0'/0",
    label: 'Mix Blockchain'
  },
  iolite: {
    path: "m/44'/1171337'/0'/0/{index}",
    basePath: "m/44'/1171337'/0'/0",
    label: 'Iolite'
  },
  thundercore: {
    path: "m/44'/1001'/0'/0/{index}",
    basePath: "m/44'/1001'/0'/0",
    label: 'ThunderCore'
  },
  solidum: {
    path: "m/44'/997'/0'/0/{index}",
    basePath: "m/44'/997'/0'/0",
    label: 'Solidum'
  },
  metadium: {
    path: "m/44'/916'/0'/0/{index}",
    basePath: "m/44'/916'/0'/0",
    label: 'Metadium'
  },
  reoscChain: {
    path: "m/44'/2894'/0'/0/{index}",
    basePath: "m/44'/2894'/0'/0",
    label: 'REOSC'
  },
  dexon: {
    path: "m/44'/237'/0'/0/{index}",
    basePath: "m/44'/237'/0'/0",
    label: 'DEXON Network'
  },
  lightstreamsNetwork: {
    path: "m/44'/60'/0'/{index}",
    basePath: "m/44'/60'/0'",
    label: 'Lightstreams Network'
  },
  mintmeComCoin: {
    path: "m/44'/227'/0'/0/{index}",
    basePath: "m/44'/227'/0'/0",
    label: 'MintMe.com Coin'
  },
  ethercore: {
    path: "m/44'/466'/0'/0/{index}",
    basePath: "m/44'/466'/0'/0",
    label: 'EtherCore'
  },
  binanceChain: {
    path: "m/44'/714'/{index}",
    basePath: "m/44'/714'",
    label: 'Binance Chain'
  },
};
export { walletConfigs, MessengerName, ledgerAppNames, bip44Paths };
