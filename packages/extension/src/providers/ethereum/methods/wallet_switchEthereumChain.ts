import { getCustomError } from "@/libs/error";
import { sendToBackgroundFromBackground } from "@/libs/messenger/extension";
import { InternalMethods } from "@/types/messenger";
import { ProviderRPCRequest } from "@/types/provider";
import { MiddlewareFunction } from "@enkryptcom/types";
import EthNetworks from "../networks";
import EthereumProvider from "..";
import { numberToHex } from "web3-utils";
import { MessageMethod } from "../types";
import DomainState from "@/libs/domain-state";
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
    const allNetworks = Object.values(EthNetworks);
    const validNetwork = allNetworks.find(
      (net) => numberToHex(net.chainID) === payload.params![0].chainId
    );
    if (validNetwork) {
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
        domainState
          .setSelectedNetwork(validNetwork.name)
          .then(() => res(null, null));
      });
    } else {
      return res(
        getCustomError(
          `wallet_switchEthereumChain: porvided network ${
            payload.params![0].chainId
          } not supported`
        )
      );
    }
  }
};
export default method;
