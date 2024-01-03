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

const dogeOptions: BitcoinNetworkOptions = {
  name: NetworkNames.Dogecoin,
  name_long: "Dogecoin",
  homePage: "https://dogecoin.com/",
  blockExplorerTX: "https://dogechain.info/tx/[[txHash]]",
  blockExplorerAddr: "https://dogechain.info/address/[[address]]",
  isTestNetwork: false,
  currencyName: "Doge",
  currencyNameLong: "Dogecoin",
  icon: require("./icons/doge.svg"),
  decimals: 8,
  node: "https://partners.mewapi.io/nodes/ss/doge",
  coingeckoID: "dogecoin",
  apiType: SSApi,
  dust: 0.01,
  activityHandler: wrapActivityHandler(ssHandler),
  basePath: "m/44'/3'/0'/0",
  feeHandler: () => {
    return SSFeeHandler("https://partners.mewapi.io/nodes/ss/doge/api/v1/fees");
  },
  networkInfo: {
    messagePrefix: "\x19Dogecoin Signed Message:\n",
    bech32: "dc",
    bip32: {
      public: 0x02facafd,
      private: 0x02fac398,
    },
    pubKeyHash: 0x1e,
    scriptHash: 0x16,
    wif: 0x9e,
    dustThreshold: null,
    paymentType: PaymentType.P2PKH,
    maxFeeRate: 5000 * 4,
  },
};

const dogecoin = new BitcoinNetwork(dogeOptions);

export default dogecoin;
