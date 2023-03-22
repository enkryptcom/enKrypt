import { polkadotEncodeAddress } from "@enkryptcom/utils";
import { NATIVE_TOKEN_ADDRESS } from "../configs";

export const isPolkadotAddress = (address: string, prefix: number) => {
  try {
    return polkadotEncodeAddress(address, prefix) === address;
  } catch {
    return false;
  }
};

export const sortByRank = (x: { rank?: number }, y: { rank?: number }) => {
  if (!x.rank || !y.rank) return -1;
  return x.rank - y.rank;
};

export const sortNativeToFront = (
  x: { address: string },
  y: { address: string }
) =>
  // eslint-disable-next-line no-nested-ternary
  x.address === NATIVE_TOKEN_ADDRESS
    ? -1
    : y.address === NATIVE_TOKEN_ADDRESS
    ? 1
    : 0;
