import icon from '../icons/sys_nevm.svg';
import { CoingeckoPlatform, NetworkNames } from "@enkryptcom/types";
import { EvmNetwork, EvmNetworkOptions } from "../../types/evm-network";
import assetsInfoHandler from "@/providers/ethereum/libs/assets-handlers/assetinfo-mew";
import { EtherscanActivity } from "../../libs/activity-handlers";
import wrapActivityHandler from "@/libs/activity-state/wrap-activity-handler";

const syscoinNEVMOptions: EvmNetworkOptions = {
  name: NetworkNames.SyscoinNEVM,
  name_long: "Syscoin NEVM",
  homePage: "https://www.syscoin.org/",
  blockExplorerTX: "https://explorer.syscoin.org/tx/[[txHash]]",
  blockExplorerAddr: "https://explorer.syscoin.org/address/[[address]]",
  chainID: "0x39",
  isTestNetwork: false,
  currencyName: "SYS",
  currencyNameLong: "Syscoin",
  node: "wss://rpc.syscoin.org/wss",
  coingeckoID: "syscoin",
  coingeckoPlatform: CoingeckoPlatform.Syscoin,
  icon,
  assetsInfoHandler,
  activityHandler: wrapActivityHandler(EtherscanActivity),
};

const syscoinNEVM = new EvmNetwork(syscoinNEVMOptions);

export default syscoinNEVM;
