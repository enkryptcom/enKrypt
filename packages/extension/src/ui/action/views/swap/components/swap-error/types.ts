type ErrorInfo = {
  title: string;
  description: string;
};

export enum SwapError {
  NO_TOKENS = 0,
  SOME_TOKENS,
  NO_TRADES,
  NETWORK_NOT_SUPPORTED,
}

export const Errors: Record<number, ErrorInfo> = {
  [SwapError.SOME_TOKENS]: {
    title: "Could not fetch some tokens",
    description:
      "There was an error getting all of the available tokens. You can swap the available tokens or try again later.",
  },
  [SwapError.NO_TOKENS]: {
    title: "Could not fetch tokens",
    description:
      "There was an error getting the available tokens. Please try again later.",
  },
  [SwapError.NO_TRADES]: {
    title: "Could not find any swaps",
    description:
      "There was an error finding a swap for these tokens. Please try again later.",
  },
};
