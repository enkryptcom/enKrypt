import { ProviderName } from "@/types/provider";
import { NetworkNames } from "@enkryptcom/types";
import Metrics from "./amplitude";
import { SwapEventType } from "./types";

const metrics = new Metrics();

const trackNetworkSelected = (
  provider: ProviderName,
  network: NetworkNames
) => {
  metrics.track("network_selected", {
    network,
    provider,
  });
};

const trackSwapEvents = (
  event: SwapEventType,
  options: {
    network: NetworkNames;
    fromToken?: string;
    toToken?: string;
    swapProvider?: string;
    error?: string;
  }
) => {
  metrics.track("swap_event", options);
};

export { trackNetworkSelected, trackSwapEvents };
