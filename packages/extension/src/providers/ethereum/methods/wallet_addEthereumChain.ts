import { getCustomError } from "@/libs/error";
import {
  CallbackFunction,
  MiddlewareFunction,
  NetworkNames,
} from "@enkryptcom/types";
import EthereumProvider from "..";
import { sendToBackgroundFromBackground } from "@/libs/messenger/extension";
import { InternalMethods } from "@/types/messenger";
import { ProviderName, ProviderRPCRequest } from "@/types/provider";
import { MessageMethod } from "../types";
import DomainState from "@/libs/domain-state";
import Web3 from "web3-eth";
import { CustomEvmNetworkOptions } from "../types/custom-evm-network";
import { numberToHex } from "web3-utils";
import { WindowPromise } from "@/libs/window-promise";
import { getAllNetworks } from "@/libs/utils/networks";
import CustomNetworksState from "@/libs/custom-networks-state";
import NetworksState from "@/libs/networks-state";
import { EvmNetwork } from "../types/evm-network";
import { addNetworkSelectMetrics } from "@/libs/metrics";

interface AddEthereumChainPayload {
  chainId: string;
  chainName: string;
  nativeCurrency: {
    name: string;
    symbol: string;
    decimals: number;
  };
  rpcUrls: string[];
  blockExplorerUrls?: string[];
}

const method: MiddlewareFunction = async function (
  this: EthereumProvider,
  payload: ProviderRPCRequest,
  res,
  next
): Promise<void> {
  if (payload.method !== "wallet_addEthereumChain") return next();
  else {
    if (
      !payload.params ||
      payload.params.length < 1 ||
      !payload.params[0].chainId
    ) {
      return res(getCustomError("wallet_addEthereumChain: invalid params"));
    }
    const setExisting = await setExistingCustomNetwork(
      payload.params![0].chainId,
      payload.options?.tabId,
      res
    );
    if (!setExisting) {
      const params: AddEthereumChainPayload = payload.params![0];
      const chainID = await networkChainId(params);
      if (chainID == null) {
        return res(
          getCustomError("Cannot add custom network, RPC not responding")
        );
      }
      const customNetworkOptions: CustomEvmNetworkOptions = {
        name: params.nativeCurrency.symbol,
        node: params.rpcUrls[0],
        name_long: params.chainName,
        chainID,
        currencyName: params.nativeCurrency.symbol,
        currencyNameLong: params.nativeCurrency.name,
      };
      if (params.blockExplorerUrls?.length) {
        let blockExplorer = params.blockExplorerUrls[0];
        if (!blockExplorer.endsWith("/")) {
          blockExplorer = `${blockExplorer}/`;
        }
        customNetworkOptions.blockExplorerTX = `${blockExplorer}tx/[[txHash]]`;
        customNetworkOptions.blockExplorerAddr = `${blockExplorer}address/[[address]]`;
      }
      const windowPromise = new WindowPromise();
      windowPromise
        .getResponse(
          this.getUIPath(this.UIRoutes.walletAddEthereumChain.path),
          JSON.stringify({
            ...payload,
            params: [JSON.stringify(customNetworkOptions)],
          })
        )
        .then(({ error }) => {
          if (error) return res(error);
          setExistingCustomNetwork(chainID, payload.options?.tabId, res);
        });
    }
  }
};
export default method;

const networkChainId = async (
  payload: AddEthereumChainPayload
): Promise<`0x${string}` | null> => {
  const rpc = payload.rpcUrls[0];
  if (!rpc) return null;
  const web3 = new Web3(rpc);
  let chainId: number | undefined;
  try {
    chainId = await web3.getChainId();
  } catch {
    return null;
  }
  if (!chainId) return null;
  return numberToHex(chainId) as `0x${string}`;
};

const setExistingCustomNetwork = async (
  chainId: `0x${string}`,
  tabId: number | undefined,
  res: CallbackFunction
): Promise<boolean> => {
  const customNetworksState = new CustomNetworksState();
  const customNetworks = await customNetworksState.getAllCustomEVMNetworks();

  let existingNetwork: CustomEvmNetworkOptions | undefined =
    customNetworks.find((net) => net.chainID === chainId);
  if (!existingNetwork) {
    const allNetworks = await getAllNetworks();
    existingNetwork = allNetworks.find(
      (net) => (net as EvmNetwork).chainID === chainId
    ) as EvmNetwork | undefined;
  }
  if (existingNetwork) {
    addNetworkSelectMetrics(
      ProviderName.ethereum,
      existingNetwork.name as NetworkNames,
      1
    );
    return sendToBackgroundFromBackground({
      message: JSON.stringify({
        method: InternalMethods.changeNetwork,
        params: [existingNetwork.name],
      }),
      provider: ProviderName.ethereum,
      tabId,
    }).then(() => {
      const domainState = new DomainState();
      const networksState = new NetworksState();
      networksState.setNetworkStatus(existingNetwork!.name, true);
      return domainState.getSelectedNetWork().then(async (curNetwork) => {
        if (curNetwork !== existingNetwork!.name) {
          await sendToBackgroundFromBackground({
            message: JSON.stringify({
              method: InternalMethods.sendToTab,
              params: [
                {
                  method: MessageMethod.changeChainId,
                  params: [existingNetwork!.chainID],
                },
              ],
            }),
            provider: ProviderName.ethereum,
            tabId,
          });
          await domainState
            .setSelectedNetwork(existingNetwork!.name)
            .then(() => res(null, null));
        }
        return true;
      });
    });
  }
  return false;
};
