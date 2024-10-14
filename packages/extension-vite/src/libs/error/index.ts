import { ErrorCodes, JSONError } from "@/providers/ethereum/types";
import { ProviderError } from "@enkryptcom/types";
import { assert } from "chai";
const errors: Record<number, any> = {
  4001: {
    name: "User Rejected Request",
    description: "The user rejected the request.",
  },
  4100: {
    name: "Unauthorized",
    description:
      "	The requested method and/or account has not been authorized by the user.",
  },
  4200: {
    name: "Unsupported Method",
    description: "The Provider does not support the requested method.",
  },
  4900: {
    name: "Disconnected",
    description: "The Provider is disconnected from all chains.",
  },
  4901: {
    name: "Chain Disconnected",
    description: "The Provider is not connected to the requested chain.",
  },
};

export const getCustomError = (msg: string, code = 8546): ProviderError => {
  const ret: ProviderError = {
    code,
    message: `${code}: ${msg}`,
  };
  return ret;
};
export const getError = (code: ErrorCodes, data?: unknown): ProviderError => {
  assert(errors[code], "error code is invalid");
  const ret: ProviderError = {
    code,
    message: `${errors[code].name}: ${errors[code].description}`,
  };
  if (data) ret.data = data;
  return ret;
};

export const getJSONError = (code: ErrorCodes, data?: unknown): JSONError => {
  return {
    error: getError(code, data),
  };
};
