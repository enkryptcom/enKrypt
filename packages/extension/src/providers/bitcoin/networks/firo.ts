import { NetworkNames } from "@enkryptcom/types";
import icon from './icons/firo.svg';
import {
  BitcoinNetwork,
  BitcoinNetworkOptions,
  PaymentType,
} from "../types/bitcoin-network";
import { firoHandler } from "../libs/activity-handlers";
import wrapActivityHandler from "@/libs/activity-state/wrap-activity-handler";
import FiroApi from "@/providers/bitcoin/libs/api-firo";
import { GasPriceTypes } from "@/providers/common/types";

const firoOptions: BitcoinNetworkOptions = {
  name: NetworkNames.Firo,
  name_long: "Firo",
  homePage: "https://explorer.firo.org",
  blockExplorerTX: "https://explorer.firo.org/tx/[[txHash]]",
  blockExplorerAddr: "https://explorer.firo.org/address/[[address]]",
  isTestNetwork: false,
  currencyName: "FIRO",
  currencyNameLong: "Firo",
  icon,
  decimals: 8,
  node: "https://explorer.firo.org",
  coingeckoID: "zcoin",
  dust: 0.0001,
  apiType: FiroApi,
  activityHandler: wrapActivityHandler(firoHandler),
  basePath: "m/44'/136'/0'/0",
  feeHandler: () =>
    Promise.resolve({
      [GasPriceTypes.FASTEST]: 25,
      [GasPriceTypes.FAST]: 20,
      [GasPriceTypes.REGULAR]: 10,
      [GasPriceTypes.ECONOMY]: 5,
    }),
  networkInfo: {
    name: NetworkNames.Firo,
    messagePrefix: "\x18Zcoin Signed Message:\n",
    bech32: "bc",
    bip32: {
      public: 0x0488b21e,
      private: 0x0488ade4,
    },
    pubKeyHash: 0x52,
    scriptHash: 0x07,
    wif: 0xd2,
    dustThreshold: null,
    paymentType: PaymentType.P2PKH,
    maxFeeRate: 5000 * 2,
  },
};

const firo = new BitcoinNetwork(firoOptions);

export default firo;
