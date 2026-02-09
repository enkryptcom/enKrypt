import { NetworkNames } from "@enkryptcom/types";
import { numberToHex } from "web3-utils";
import {
  ProviderName,
  ProviderNameProper,
  SupportedNetworkName,
  WalletIdentifier,
} from "./types";

import oneInchIcon from "./common/icons/1inch-logo.png";
import paraswapIcon from "./common/icons/paraswap-logo.png";
import zeroxIcon from "./common/icons/0x-logo.png";
import changellyIcon from "./common/icons/changelly-logo.png";
import jupiterIcon from "./common/icons/jupiter-logo.png";
import okxIcon from "./common/icons/okx-logo.png";
import rangoIcon from "./common/icons/rango-logo.png";

export type SwapFeeConfig = {
  referrer: string;
  /** Percentage fee (0 to 1) */
  fee: number;
};

const PROVIDER_INFO: Record<
  ProviderName,
  { name: ProviderNameProper; icon: any }
> = {
  [ProviderName.oneInch]: {
    name: ProviderNameProper.oneInch,
    icon: oneInchIcon,
  },
  [ProviderName.oneInchFusion]: {
    name: ProviderNameProper.oneInchFusion,
    icon: oneInchIcon,
  },
  [ProviderName.paraswap]: {
    name: ProviderNameProper.paraswap,
    icon: paraswapIcon,
  },
  [ProviderName.zerox]: {
    name: ProviderNameProper.zerox,
    icon: zeroxIcon,
  },
  [ProviderName.rango]: {
    name: ProviderNameProper.rango,
    icon: rangoIcon,
  },
  [ProviderName.jupiter]: {
    name: ProviderNameProper.jupiter,
    icon: jupiterIcon,
  },
  [ProviderName.okx]: {
    name: ProviderNameProper.okx,
    icon: okxIcon,
  },
  [ProviderName.changelly]: {
    name: ProviderNameProper.changelly,
    icon: changellyIcon,
  },
};

const FEE_CONFIGS: Partial<
  Record<ProviderName, Partial<Record<WalletIdentifier, SwapFeeConfig>>>
> = {
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
  [ProviderName.oneInchFusion]: {
    [WalletIdentifier.enkrypt]: {
      referrer: "0x551d9d8eb02e1c713009da8f7c194870d651054a",
      fee: 88,
    },
    [WalletIdentifier.mew]: {
      referrer: "0x87A265C93D2A92C6EEEC002283bEaEbb4564Fd20",
      fee: 250,
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
  [ProviderName.rango]: {
    [WalletIdentifier.enkrypt]: {
      // TODO: verify this works on SOL transactions
      referrer: "0xabe295bac4b5bce0edcf42d180a3a952ef718b9e",
      fee: 0.00875,
    },
    [WalletIdentifier.mew]: {
      referrer: "0x48ae878bf9f752ee65679c017e32e4cafac51696",
      fee: 0.025,
    },
  },
  // This address is the referral address created in the Jupiter fee dashboard
  // You'll need to create an SPL token address using the jupiter dashboard for
  // each kind of asset you want to receive fees for
  [ProviderName.jupiter]: {
    [WalletIdentifier.enkrypt]: {
      referrer: "HXWkRK9a4H1EuBiqP4sVfFsEpd2NasoQPScoXL1NgSE2",
      fee: 0.01,
    },
    [WalletIdentifier.mew]: {
      referrer: "CmrkoXWiTW37ZqUZcfJtxiKhy9eRMBQHq1nm8HpmRXH4",
      fee: 0.03,
    },
  },
  [ProviderName.okx]: {
    [WalletIdentifier.enkrypt]: {
      referrer: "AGVteri2nwBsY8w95PuJCoFWxd6ZLwMQKVftaKJu4knV",
      fee: 0.01,
    },
    [WalletIdentifier.mew]: {
      referrer: "8GkSjqJUCzfLw96wKWMvTcLcbZsX7n69ZEQ3FE3KbPEq",
      fee: 0.03,
    },
  },
};

const TOKEN_LISTS: {
  [key in NetworkNames]?: string;
} = {
  [NetworkNames.Ethereum]: `https://raw.githubusercontent.com/enkryptcom/dynamic-data/main/swaplists/${SupportedNetworkName.Ethereum}.json`,
  [NetworkNames.Binance]: `https://raw.githubusercontent.com/enkryptcom/dynamic-data/main/swaplists/${SupportedNetworkName.Binance}.json`,
  [NetworkNames.Matic]: `https://raw.githubusercontent.com/enkryptcom/dynamic-data/main/swaplists/${SupportedNetworkName.Matic}.json`,
  [NetworkNames.Optimism]: `https://raw.githubusercontent.com/enkryptcom/dynamic-data/main/swaplists/${SupportedNetworkName.Optimism}.json`,
  [NetworkNames.Arbitrum]: `https://raw.githubusercontent.com/enkryptcom/dynamic-data/main/swaplists/${SupportedNetworkName.Arbitrum}.json`,
  [NetworkNames.Aurora]: `https://raw.githubusercontent.com/enkryptcom/dynamic-data/main/swaplists/${SupportedNetworkName.Aurora}.json`,
  [NetworkNames.Avalanche]: `https://raw.githubusercontent.com/enkryptcom/dynamic-data/main/swaplists/${SupportedNetworkName.Avalanche}.json`,
  [NetworkNames.EthereumClassic]: `https://raw.githubusercontent.com/enkryptcom/dynamic-data/main/swaplists/${SupportedNetworkName.EthereumClassic}.json`,
  [NetworkNames.Fantom]: `https://raw.githubusercontent.com/enkryptcom/dynamic-data/main/swaplists/${SupportedNetworkName.Fantom}.json`,
  [NetworkNames.Moonbeam]: `https://raw.githubusercontent.com/enkryptcom/dynamic-data/main/swaplists/${SupportedNetworkName.Moonbeam}.json`,
  [NetworkNames.Gnosis]: `https://raw.githubusercontent.com/enkryptcom/dynamic-data/main/swaplists/${SupportedNetworkName.Gnosis}.json`,
  [NetworkNames.Kaia]: `https://raw.githubusercontent.com/enkryptcom/dynamic-data/main/swaplists/${SupportedNetworkName.Kaia}.json`,
  [NetworkNames.ZkSync]: `https://raw.githubusercontent.com/enkryptcom/dynamic-data/main/swaplists/${SupportedNetworkName.Zksync}.json`,
  [NetworkNames.Base]: `https://raw.githubusercontent.com/enkryptcom/dynamic-data/main/swaplists/${SupportedNetworkName.Base}.json`,
  [NetworkNames.MaticZK]: `https://raw.githubusercontent.com/enkryptcom/dynamic-data/main/swaplists/${SupportedNetworkName.MaticZK}.json`,
  [NetworkNames.Solana]: `https://raw.githubusercontent.com/enkryptcom/dynamic-data/main/swaplists/${SupportedNetworkName.Solana}.json`,
  [NetworkNames.Rootstock]: `https://raw.githubusercontent.com/enkryptcom/dynamic-data/main/swaplists/${SupportedNetworkName.Rootstock}.json`,
  [NetworkNames.Blast]: `https://raw.githubusercontent.com/enkryptcom/dynamic-data/main/swaplists/${SupportedNetworkName.Blast}.json`,
  [NetworkNames.Telos]: `https://raw.githubusercontent.com/enkryptcom/dynamic-data/main/swaplists/${SupportedNetworkName.Telos}.json`,
};

const RWA_FILTER_LIST = "https://raw.githubusercontent.com/enkryptcom/dynamic-data/refs/heads/main/configs/filtered-rwa-addresses.json"
const IP_COMPLY_URL = "https://partners.mewapi.io/o/ipcomply"
/**
 * ```sh
 * curl -sL https://raw.githubusercontent.com/enkryptcom/dynamic-data/main/swaplists/changelly.json | jq . -C | less -R
 * ```
 */
const CHANGELLY_LIST =
  "https://raw.githubusercontent.com/enkryptcom/dynamic-data/main/swaplists/changelly.json";

/**
 * ```sh
 * curl -sL https://raw.githubusercontent.com/enkryptcom/dynamic-data/main/swaplists/top-tokens.json | jq . -C | less -R
 * ```
 */
const TOP_TOKEN_INFO_LIST =
  "https://raw.githubusercontent.com/enkryptcom/dynamic-data/main/swaplists/top-tokens.json";

const GAS_LIMITS = {
  approval: numberToHex(300000),
  transferToken: numberToHex(300000),
  swap: numberToHex(1000000),
  Wrap: numberToHex(70000),
};
const NATIVE_TOKEN_ADDRESS = "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee";

/** 0.5% (unit: 0-100 percentage) */
const DEFAULT_SLIPPAGE = "0.5";

export {
  FEE_CONFIGS,
  GAS_LIMITS,
  NATIVE_TOKEN_ADDRESS,
  TOKEN_LISTS,
  CHANGELLY_LIST,
  TOP_TOKEN_INFO_LIST,
  DEFAULT_SLIPPAGE,
  PROVIDER_INFO,
  RWA_FILTER_LIST,
  IP_COMPLY_URL
};
