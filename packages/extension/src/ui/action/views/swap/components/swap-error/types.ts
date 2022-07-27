type ErrorInfo = {
  title: string;
  description: string;
};

export enum SwapError {
  NO_TOKENS = 0,
  SOME_TOKENS,
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
};
