import { LedgerApps } from "./substrateApps";
import { getAddressRequest } from "../types";
import { bip32ToAddressNList } from "./utils";
import type Transport from "@ledgerhq/hw-transport";

class Ledger {
  transport: Transport;

  constructor(transport: Transport) {
    this.transport = transport;
  }

  async getAddress(options: getAddressRequest): Promise<string> {
    if (!LedgerApps[options.networkName])
      return Promise.reject("ledger-substrate: Invalid network name");
    const app = LedgerApps[options.networkName];
    const pathValues = bip32ToAddressNList(options.path);
    if (pathValues.length < 3)
      return Promise.reject("ledger-substrate: Invalid path");
    const connection = app(this.transport);
    return connection
      .getAddress(
        pathValues[0],
        pathValues[1],
        pathValues[2],
        options.confirmAddress
      )
      .then((res) => res.address);
  }

  signMessage(_options: unknown) {
    throw new Error("Not Supported");
  }
}

export default Ledger;
