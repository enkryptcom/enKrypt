import icon from './icons/cytonic.webp';
import { EvmNetwork, EvmNetworkOptions } from "../types/evm-network";
import { NetworkNames } from "@enkryptcom/types";
import wrapActivityHandler from "@/libs/activity-state/wrap-activity-handler";
import { EtherscanActivity } from '../libs/activity-handlers';

const netOptions: EvmNetworkOptions = {
    name: NetworkNames.CytonicTestnet,
    name_long: "Cytonic Testnet",
    homePage: "https://cytonic.com",
    blockExplorerTX: "https://explorer.evm.testnet.cytonic.com/tx/[[txHash]]",
    blockExplorerAddr: "https://explorer.evm.testnet.cytonic.com/address/[[address]]",
    chainID: '0xcc02',
    isTestNetwork: true,
    currencyName: "CCC",
    currencyNameLong: "Cytonic Coin",
    node: 'https://rpc.evm.testnet.cytonic.com',
    icon,
    activityHandler: wrapActivityHandler(EtherscanActivity),
};

const cytonicTestnet = new EvmNetwork(netOptions);

export default cytonicTestnet;