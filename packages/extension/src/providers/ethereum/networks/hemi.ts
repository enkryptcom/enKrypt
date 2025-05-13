import { EvmNetwork, EvmNetworkOptions } from "../types/evm-network";

const netOptions: EvmNetworkOptions = {
    name: NetworkNames.Hemi,
    name_long: 'Hemi',
    homePage: 'https://hemi.xyz/',
    blockExplorerTX: 'https://explorer.hemi.xyz/tx/[[txHash]]',
    blockExplorerAddr: 'https://explorer.hemi.xyz/address/[[address]]',
    chainID: '0xa867',
    isTestNetwork: false,
    currencyName: 'ETH',
    currencyNameLong: 'Ethereum',
    node: 'wss://rpc.hemi.network/wsrpc',
    icon,
    
    activityHandler: wrapActivityHandler(EtherscanActivity),
  };
  
  const net = new EvmNetwork(netOptions);
  
  export default net;