import { getCustomError } from "@/libs/error";
import { sendToBackgroundFromBackground } from "@/libs/messenger/extension";
import { InternalMethods } from "@/types/messenger";
import { ProviderRPCRequest } from "@/types/provider";
import { MiddlewareFunction } from "@enkryptcom/types";
import EthereumProvider from "..";
import { MessageMethod } from "../types";
import DomainState from "@/libs/domain-state";
import { getAllNetworks } from "@/libs/utils/networks";
import { EvmNetwork } from "../types/evm-network";
import NetworksState from "@/libs/networks-state";
import { addNetworkSelectMetrics } from "@/libs/metrics";

const method: MiddlewareFunction = function (
  this: EthereumProvider,
  payload: ProviderRPCRequest,
  res,
  next
): void {
  if (payload.method !== "wallet_switchEthereumChain") return next();
  else {
    if (
      !payload.params ||
      payload.params.length < 1 ||
      !payload.params[0].chainId
    ) {
      return res(getCustomError("wallet_switchEthereumChain: invalid params"));
    }

    getAllNetworks().then((allNetworks) => {
      const validNetwork: EvmNetwork | undefined = allNetworks.find(
        (net) => (net as EvmNetwork).chainID === payload.params![0].chainId
      ) as EvmNetwork | undefined;
      if (validNetwork) {
        addNetworkSelectMetrics(validNetwork.provider, validNetwork.name, 1);
        sendToBackgroundFromBackground({
          message: JSON.stringify({
            method: InternalMethods.changeNetwork,
            params: [validNetwork.name],
          }),
          provider: validNetwork.provider,
          tabId: payload.options?.tabId,
        }).then(() => {
          sendToBackgroundFromBackground({
            message: JSON.stringify({
              method: InternalMethods.sendToTab,
              params: [
                {
                  method: MessageMethod.changeChainId,
                  params: [validNetwork.chainID],
                },
              ],
            }),
            provider: validNetwork.provider,
            tabId: payload.options?.tabId,
          });
          const domainState = new DomainState();
          const networksState = new NetworksState();
          networksState.setNetworkStatus(validNetwork.name, true);
          domainState
            .setSelectedNetwork(validNetwork.name)
            .then(() => res(null, null));
        });
      } else {
        return res(
          getCustomError(
            `wallet_switchEthereumChain: provided network ${
              payload.params![0].chainId
            } not supported`
          )
        );
      }
    });
  }
};
export default method;
