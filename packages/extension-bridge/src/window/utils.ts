import { Endpoint, RuntimeContext } from "../types";

const ENDPOINT_RE =
  /^((?:background$)|devtools|popup|options|content-script|window)(?:@(\d+)(?:\.(\d+))?)?$/;

export const parseEndpoint = (endpoint: string): Endpoint => {
  const [, context, tabId, frameId] = endpoint.match(ENDPOINT_RE) || [];

  return {
    context: context as RuntimeContext,
    tabId: +tabId,
    frameId: frameId ? +frameId : undefined,
  };
};

export const isInternalEndpoint = ({ context: ctx }: Endpoint): boolean =>
  ["content-script", "background", "devtools"].includes(ctx);
