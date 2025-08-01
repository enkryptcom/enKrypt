import icon from './icons/applayer.webp';
import { EvmNetwork, EvmNetworkOptions } from "../types/evm-network";
import { NetworkNames } from "@enkryptcom/types";
import wrapActivityHandler from "@/libs/activity-state/wrap-activity-handler";
import { EtherscanActivity } from '../libs/activity-handlers';

const netOptions: EvmNetworkOptions = {
    name: NetworkNames.AppLayerTestnet,
    name_long: "AppLayer Testnet",
    homePage: "https://applayer.com",
    blockExplorerTX: "https://testnet-explorer.applayer.com/tx/[[txHash]]",
    blockExplorerAddr: "https://testnet-explorer.applayer.com/address/[[address]]",
    chainID: '0x1264a',
    isTestNetwork: true,
    currencyName: "APPL",
    currencyNameLong: "AppLayer",
    node: 'https://testnet-api.applayer.com',
    icon,
    activityHandler: wrapActivityHandler(EtherscanActivity),
};

const appLayerTestnet = new EvmNetwork(netOptions);

export default appLayerTestnet;