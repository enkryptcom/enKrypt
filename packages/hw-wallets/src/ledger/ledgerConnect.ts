import { NetworkNames } from "@enkryptcom/types";
import getDeviceInfo from "@ledgerhq/live-common/lib/hw/getDeviceInfo";
import openApp from "@ledgerhq/live-common/lib/hw/openApp";
import getAppAndVersion from "@ledgerhq/live-common/lib/hw/getAppAndVersion";
import type LedgerEthereum from "./ethereum";
import type LedgerSubstrate from "./substrate";
import type LedgerKadena from "./kadena";
import { ledgerAppNames } from "../configs";

function connect(
  this: LedgerEthereum | LedgerSubstrate | LedgerKadena,
  networkName: NetworkNames
): Promise<boolean> {
  return getDeviceInfo(this.transport)
    .then(() =>
      openApp(this.transport, ledgerAppNames[networkName])
        .then(() => true)
        .catch(() => {
          throw new Error(
            `Make sure you have ${ledgerAppNames[networkName]} App installed on your ledger`
          );
        })
    )
    .catch((e) => {
      if (e.message === "DeviceOnDashboardExpected") {
        return getAppAndVersion(this.transport).then((appInfo) => {
          if (appInfo.name !== ledgerAppNames[networkName])
            throw new Error(
              `Make sure you have ${ledgerAppNames[networkName]} App opened`
            );
          return true;
        });
      }
      throw e;
    });
}

export default connect;
