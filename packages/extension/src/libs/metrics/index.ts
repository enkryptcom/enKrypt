import { ProviderName } from "@/types/provider";
import { NetworkNames } from "@enkryptcom/types";
import { debounce } from "lodash";

const networkRequestsCounter: Record<string, Record<string, number>> = {};

const send = () => {
  const cloneCounter = { ...networkRequestsCounter };
  Object.keys(networkRequestsCounter).forEach(
    (provider) => (networkRequestsCounter[provider] = {})
  );
  fetch("https://partners.mewapi.io/enkrypt-metrics", {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      method: "enkrypt_requests",
      params: [cloneCounter],
    }),
  });
};

const sendMetrics = debounce(send, 2000);

export const addNetworkSelectMetrics = (
  provider: ProviderName,
  network: NetworkNames,
  count: number
) => {
  if (!networkRequestsCounter[provider]) networkRequestsCounter[provider] = {};
  if (!networkRequestsCounter[provider][network])
    networkRequestsCounter[provider][network] = 0;
  networkRequestsCounter[provider][network] += count;
  sendMetrics();
};
