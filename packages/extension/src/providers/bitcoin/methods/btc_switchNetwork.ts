import { getCustomError } from "@/libs/error";
import { sendToBackgroundFromBackground } from "@/libs/messenger/extension";
import { InternalMethods } from "@/types/messenger";
import { ProviderRPCRequest } from "@/types/provider";
import { MiddlewareFunction } from "@enkryptcom/types";
import BTCNetworks from "../networks";
import DomainState from "@/libs/domain-state";
import BitcoinProvider from "..";
import { BitcoinNetworks } from "../types";
import { addNetworkSelectMetrics } from "@/libs/metrics";
const method: MiddlewareFunction = function (
  this: BitcoinProvider,
  payload: ProviderRPCRequest,
  res,
  next
): void {
  if (payload.method !== "btc_switchNetwork") return next();
  else {
    if (
      !payload.params ||
      payload.params.length < 1 ||
      !Object.values(BitcoinNetworks).includes(payload.params[0])
    ) {
      return res(getCustomError("btc_switchNetwork: invalid params"));
    }
    const allNetworks = Object.values(BTCNetworks);
    const validNetwork = allNetworks.find(
      (net) => net.name === payload.params![0]
    );
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
        const domainState = new DomainState();
        domainState
          .setSelectedNetwork(validNetwork.name)
          .then(() => res(null, true));
      });
    } else {
      return res(
        getCustomError(
          `btc_switchNetwork: porvided network ${
            payload.params![0]
          } not supported`
        )
      );
    }
  }
};
export default method;
