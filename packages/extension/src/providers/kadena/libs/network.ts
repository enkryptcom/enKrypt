import KDANetworks from "../networks";

export function getNetworkInfo(networkName: string) {
  const networkObject = Object.values(KDANetworks).find(
    (n) => n.name === networkName
  );

  return {
    name: networkName,
    node: networkObject?.node || "",
    networkId: networkObject?.options.kadenaApiOptions.networkId || "",
    chainId: networkObject?.options.kadenaApiOptions.chainId || "",
    explorer: networkObject?.options.blockExplorerTX || "",
  };
}
