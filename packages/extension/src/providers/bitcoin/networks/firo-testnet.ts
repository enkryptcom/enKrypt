import { NetworkNames } from "@enkryptcom/types";
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
  name: NetworkNames.FiroTest,
  name_long: "Firo Testnet",
  homePage: "https://testexplorer.firo.org",
  blockExplorerTX: "https://testexplorer.firo.org/tx/[[txHash]]",
  blockExplorerAddr: "https://testexplorer.firo.org/address/[[address]]",
  isTestNetwork: true,
  currencyName: "tFIRO",
  currencyNameLong: "tFiro",
  icon: require("./icons/firo.svg"),
  decimals: 8,
  node: "https://testexplorer.firo.org",
  coingeckoID: "zcoin",
  dust: 0.0001,
  apiType: FiroApi,
  activityHandler: wrapActivityHandler(firoHandler),
  basePath: "m/44'/1'/0'/0",
  feeHandler: () =>
    Promise.resolve({
      [GasPriceTypes.FASTEST]: 25,
      [GasPriceTypes.FAST]: 20,
      [GasPriceTypes.REGULAR]: 10,
      [GasPriceTypes.ECONOMY]: 5,
    }),
  networkInfo: {
    name: NetworkNames.FiroTest,
    messagePrefix: "\x18Zcoin Signed Message:\n",
    bech32: "tb",
    bip32: {
      public: 0x043587cf,
      private: 0x04358394,
    },
    pubKeyHash: 0x41,
    scriptHash: 0xb2,
    wif: 0xb9,
    dustThreshold: null,
    paymentType: PaymentType.P2PKH,
    maxFeeRate: 5000 * 2,
  },
};

const firoTestnet = new BitcoinNetwork(firoOptions);

export default firoTestnet;
