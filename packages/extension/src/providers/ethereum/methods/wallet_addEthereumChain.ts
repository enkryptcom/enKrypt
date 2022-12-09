import { getCustomError } from "@/libs/error";
import { MiddlewareFunction } from "@enkryptcom/types";
import EthereumProvider from "..";
import { sendToBackgroundFromBackground } from "@/libs/messenger/extension";
import { InternalMethods } from "@/types/messenger";
import { ProviderRPCRequest } from "@/types/provider";
import { MessageMethod } from "../types";
import DomainState from "@/libs/domain-state";
import Web3 from "web3-eth";
import { getAllNetworks } from "@/libs/utils/networks";
import { EvmNetwork } from "../types/evm-network";
import { CustomEvmNetworkOptions } from "../types/custom-evm-network";
import { numberToHex } from "web3-utils";
import { WindowPromise } from "@/libs/window-promise";

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
    const allNetworks = await getAllNetworks();
    const existingNetwork: EvmNetwork | undefined = allNetworks.find(
      (net) => (net as EvmNetwork).chainID === payload.params![0].chainId
    ) as EvmNetwork | undefined;
    if (existingNetwork) {
      sendToBackgroundFromBackground({
        message: JSON.stringify({
          method: InternalMethods.changeNetwork,
          params: [existingNetwork.name],
        }),
        provider: existingNetwork.provider,
        tabId: payload.options?.tabId,
      }).then(() => {
        const domainState = new DomainState();
        domainState.getSelectedNetWork().then((curNetwork) => {
          if (curNetwork !== existingNetwork.name) {
            sendToBackgroundFromBackground({
              message: JSON.stringify({
                method: InternalMethods.sendToTab,
                params: [
                  {
                    method: MessageMethod.changeChainId,
                    params: [existingNetwork.chainID],
                  },
                ],
              }),
              provider: existingNetwork.provider,
              tabId: payload.options?.tabId,
            });
            domainState
              .setSelectedNetwork(existingNetwork.name)
              .then(() => res(null, null));
          }
        });
      });
    } else {
      const params: AddEthereumChainPayload = payload.params![0];

      const chainID = await networkChainId(params);
      if (chainID == null) {
        return res(getCustomError("Not implemented"));
      }

      const customNetworkOptions: CustomEvmNetworkOptions = {
        name: params.nativeCurrency.symbol,
        node: params.rpcUrls[0],
        name_long: params.chainName,
        chainID,
        currencyName: params.nativeCurrency.symbol,
        currencyNameLong: params.nativeCurrency.name,
      };

      const windowPromise = new WindowPromise();
      windowPromise
        .getResponse(
          this.getUIPath(this.UIRoutes.walletAddEthereumChain.path),
          JSON.stringify({
            ...payload,
            params: [JSON.stringify(customNetworkOptions)],
          })
        )
        .then(({ error, result }) => {
          if (error) return res(error);
          res(null, JSON.parse(result as string));
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
