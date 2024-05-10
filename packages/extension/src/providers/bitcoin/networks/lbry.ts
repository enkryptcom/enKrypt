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

const lbryOptions: BitcoinNetworkOptions = {
  name: NetworkNames.LBRY,
  name_long: "LBRY",
  homePage: "https://lbry.com/",
  blockExplorerTX: "https://explorer.lbry.com/tx/[[txHash]]",
  blockExplorerAddr: "https://explorer.lbry.com/address/[[address]]",
  isTestNetwork: false,
  currencyName: "LBC",
  currencyNameLong: "LBRY Credits",
  icon: require("./icons/lbry.svg"),
  decimals: 8,
  node: "https://partners.mewapi.io/nodes/ss/lbc",
  coingeckoID: "lbry-credits",
  apiType: SSApi,
  dust: 0.01,
  activityHandler: wrapActivityHandler(ssHandler),
  basePath: "m/44'/140'/0'/0",
  feeHandler: () => {
    return SSFeeHandler("https://partners.mewapi.io/nodes/ss/lbc/api/v1/fees");
  },
  networkInfo: {
    name: NetworkNames.LBRY,
    messagePrefix: "\x19LBRY Signed Message:\n",
    bech32: "lbc",
    bip32: {
      public: 0x0488b21e,
      private: 0x0488ade4,
    },
    pubKeyHash: 0x55,
    scriptHash: 0x7a,
    wif: 0x1c,
    dustThreshold: null,
    paymentType: PaymentType.P2PKH,
    maxFeeRate: 100000 * 10,
  },
};

const lbry = new BitcoinNetwork(lbryOptions);

export default lbry;
