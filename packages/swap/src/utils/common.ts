import { polkadotEncodeAddress } from "@enkryptcom/utils";

export const isPolkadotAddress = (address: string, prefix: number) => {
  try {
    return polkadotEncodeAddress(address, prefix) === address;
  } catch {
    return false;
  }
};
