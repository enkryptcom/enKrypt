import KDANetworks from '../networks';
import { isHex } from 'web3-utils';

export const getNetworkInfo = (networkName: string) => {
  const networkObject = Object.values(KDANetworks).find(
    n => n.name === networkName,
  );

  return {
    name: networkName,
    node: networkObject?.node || '',
    networkId: networkObject?.options.kadenaApiOptions.networkId || '',
    chainId: networkObject?.options.kadenaApiOptions.chainId || '',
    explorer: networkObject?.options.blockExplorerTX || '',
  };
};

export const isValidAddress = (address: string) =>
  address.startsWith('k:') &&
  isHex(address.replace('k:', '')) &&
  address.length === 66;
