import { NetworkNames } from "@enkryptcom/types";
import {
  BitcoinNetwork,
  BitcoinNetworkOptions,
  PaymentType,
} from "../types/bitcoin-network";
import { ssHandler } from "../libs/activity-handlers";
import wrapActivityHandler from "@/libs/activity-state/wrap-activity-handler";
import SSFeeHandler from "../libs/ss-fee-handler";
import SSApi from "../libs/api-ss";

const litecoinOptions: BitcoinNetworkOptions = {
  name: NetworkNames.Litecoin,
  name_long: "Litecoin",
  homePage: "https://litecoin.org/",
  blockExplorerTX: "https://explorer.btc.com/ltc/transaction/[[txHash]]",
  blockExplorerAddr: "https://explorer.btc.com/ltc/address/[[address]]",
  isTestNetwork: false,
  currencyName: "LTC",
  currencyNameLong: "Litecoin",
  icon: require("./icons/ltc.svg"),
  decimals: 8,
  node: "https://partners.mewapi.io/nodes/ss/ltc",
  coingeckoID: "litecoin",
  dust: 0.0001,
  apiType: SSApi,
  activityHandler: wrapActivityHandler(ssHandler),
  basePath: "m/49'/2'/0'/0",
  feeHandler: () => {
    return SSFeeHandler("https://partners.mewapi.io/nodes/ss/ltc/api/v1/fees");
  },
  networkInfo: {
    messagePrefix: "\x19Litecoin Signed Message:\n",
    bech32: "ltc",
    bip32: {
      public: 0x019da462,
      private: 0x019d9cfe,
    },
    pubKeyHash: 0x30,
    scriptHash: 0x32,
    wif: 0xb0,
    dustThreshold: null,
    paymentType: PaymentType.P2WPKH,
  },
};

const litecoin = new BitcoinNetwork(litecoinOptions);

export default litecoin;
