import { NetworkNames } from "@enkryptcom/types";
import { numberToHex } from "web3-utils";
import { ProviderName, WalletIdentifier } from "./types";

const FEE_CONFIGS = {
  [ProviderName.oneInch]: {
    [WalletIdentifier.enkrypt]: {
      referrer: "0x551d9d8eb02e1c713009da8f7c194870d651054a",
      fee: 0.00875,
    },
    [WalletIdentifier.mew]: {
      referrer: "0x87A265C93D2A92C6EEEC002283bEaEbb4564Fd20",
      fee: 0.025,
    },
  },
  [ProviderName.paraswap]: {
    [WalletIdentifier.enkrypt]: {
      referrer: "0x9d24aceac6fbfb3f7ff4c751217d41afc12f43b6",
      fee: 0.00875,
    },
    [WalletIdentifier.mew]: {
      referrer: "0xb80a5ea0ec9732cc1875d088495df8c8782dd6b7",
      fee: 0.025,
    },
  },
  [ProviderName.zerox]: {
    [WalletIdentifier.enkrypt]: {
      referrer: "0x485a5ec817711874e49bc01d6c63a7ca9db33653",
      fee: 0.00875,
    },
    [WalletIdentifier.mew]: {
      referrer: "0xD6135f846dbC86d34E69F138b86E87d3eF2A56D0",
      fee: 0.025,
    },
  },
};

const TOKEN_LISTS: {
  [key in NetworkNames]?: string;
} = {
  [NetworkNames.Ethereum]:
    "https://raw.githubusercontent.com/enkryptcom/dynamic-data/main/swaplists/ETH.json",
  [NetworkNames.Binance]:
    "https://raw.githubusercontent.com/enkryptcom/dynamic-data/main/swaplists/BNB.json",
  [NetworkNames.Matic]:
    "https://raw.githubusercontent.com/enkryptcom/dynamic-data/main/swaplists/MATIC.json",
  [NetworkNames.Optimism]:
    "https://raw.githubusercontent.com/enkryptcom/dynamic-data/main/swaplists/OP.json",
};

const CHANGELLY_LIST =
  "https://raw.githubusercontent.com/enkryptcom/dynamic-data/main/swaplists/changelly.json";

const TOP_TOKEN_INFO_LIST =
  "https://raw.githubusercontent.com/enkryptcom/dynamic-data/main/swaplists/top-tokens.json";

const GAS_LIMITS = {
  approval: numberToHex(300000),
  transferToken: numberToHex(300000),
  swap: numberToHex(1000000),
};
const NATIVE_TOKEN_ADDRESS = "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee";

export {
  FEE_CONFIGS,
  GAS_LIMITS,
  NATIVE_TOKEN_ADDRESS,
  TOKEN_LISTS,
  CHANGELLY_LIST,
  TOP_TOKEN_INFO_LIST,
};