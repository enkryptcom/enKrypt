import { NetworkNames } from "@enkryptcom/types";
import { EvmNetwork, EvmNetworkOptions } from "./evm-network";
import wrapActivityHandler from "@/libs/activity-state/wrap-activity-handler";

export interface CustomEvmNetworkOptions {
  name: string;
  name_long: string;
  chainID: `0x${string}`;
  currencyName: string;
  currencyNameLong: string;
  node: string;
  blockExplorerAddr?: string;
  blockExplorerTX?: string;
}

export class CustomEvmNetwork extends EvmNetwork {
  public isCustomNetwork = true;

  constructor(options: CustomEvmNetworkOptions) {
    const networkName = options.name as NetworkNames;

    const evmNetworkOptions: EvmNetworkOptions = {
      ...options,
      icon: require("../networks/icons/eth.svg"),
      gradient: "linear-gradient(180deg, #C549FF 0%, #684CFF 100%)",
      activityHandler: wrapActivityHandler(() => Promise.resolve([])),
      blockExplorerAddr:
        options.blockExplorerAddr ?? "https://www.enkrypt.com/",
      blockExplorerTX: options.blockExplorerTX ?? "https://www.enkrypt.com/",
      homePage: "https://www.enkrypt.com/",
      isTestNetwork: false,
      name: networkName,
    };
    super(evmNetworkOptions);
  }
}
