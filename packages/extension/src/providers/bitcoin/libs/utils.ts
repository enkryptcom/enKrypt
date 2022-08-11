import { BitcoinNetworkInfo } from "../types";
import { address as BTCAddress } from "bitcoinjs-lib";

const isAddress = (address: string, network: BitcoinNetworkInfo): boolean => {
  try {
    BTCAddress.toOutputScript(address, network);
    return true;
  } catch {
    return false;
  }
};

export { isAddress };
