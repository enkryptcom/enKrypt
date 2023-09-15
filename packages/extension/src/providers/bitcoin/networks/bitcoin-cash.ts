import { NetworkNames } from "@enkryptcom/types";
import {
  BitcoinNetwork,
  BitcoinNetworkOptions,
  PaymentType,
} from "../types/bitcoin-network";
import { haskoinHandler } from "../libs/activity-handlers";
import wrapActivityHandler from "@/libs/activity-state/wrap-activity-handler";
import SSFeeHandler from "../libs/ss-fee-handler";
import SSApi from "../libs/api-ss";

const bitcoinOptions: BitcoinNetworkOptions = {
  name: NetworkNames.BitcoinCash,
  name_long: "Bitcoin Cash",
  homePage: "https://bitcoincash.org/",
  blockExplorerTX: "https://www.blockchain.com/bch/tx/[[txHash]]",
  blockExplorerAddr: "https://www.blockchain.com/bch/address/[[address]]",
  isTestNetwork: false,
  currencyName: "BCH",
  currencyNameLong: "Bitcoin Cash",
  icon: require("./icons/bch.svg"),
  decimals: 8,
  node: "https://partners.mewapi.io/nodes/ss/bch",
  coingeckoID: "bitcoin-cash",
  activityHandler: wrapActivityHandler(haskoinHandler),
  basePath: "m/49'/145'/0'/0",
  feeHandler: () => {
    return SSFeeHandler("https://partners.mewapi.io/nodes/ss/bch/api/v1/fees");
  },
  apiType: SSApi,
  dust: 0.00000546,
  networkInfo: {
    messagePrefix: "\x18Bitcoin Signed Message:\n",
    bech32: "bitcoincash",
    bip32: {
      public: 0x0488b21e,
      private: 0x0488ade4,
    },
    pubKeyHash: 0x00,
    scriptHash: 0x05,
    wif: 0x80,
    dustThreshold: null,
    paymentType: PaymentType.P2PKH,
  },
};

const bitcoin = new BitcoinNetwork(bitcoinOptions);

export default bitcoin;
