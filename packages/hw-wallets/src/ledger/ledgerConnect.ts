import { NetworkNames } from "@enkryptcom/types";
import getDeviceInfo from "@ledgerhq/live-common/lib/hw/getDeviceInfo";
import openApp from "@ledgerhq/live-common/lib/hw/openApp";
import getAppAndVersion from "@ledgerhq/live-common/lib/hw/getAppAndVersion";
import type LedgerEthereum from "./ethereum";
import type LedgerSubstrate from "./substrate";
import { ledgerAppNames } from "../configs";

function connect(
  this: LedgerEthereum | LedgerSubstrate,
  networkName: NetworkNames,
): Promise<boolean> {
  const appName = ledgerAppNames[networkName]
    ? ledgerAppNames[networkName]
    : ledgerAppNames[NetworkNames.Ethereum];
  return getDeviceInfo(this.transport)
    .then(() =>
      openApp(this.transport, appName)
        .then(() => true)
        .catch(() => {
          throw new Error(
            `Make sure you have ${appName} App installed on your ledger`,
          );
        }),
    )
    .catch((e) => {
      if (e.message === "DeviceOnDashboardExpected") {
        return getAppAndVersion(this.transport).then((appInfo) => {
          if (appInfo.name !== appName)
            throw new Error(`Make sure you have ${appName} App opened`);
          return true;
        });
      }
      throw e;
    });
}

export default connect;
