import Browser from "webextension-polyfill";
import { namespace } from "@/ui/onboard/hardware-wallet/routes";
export default (networkName: string) => {
  const hardwareWalletURL = Browser.runtime.getURL(
    `onboard.html#/${namespace}/?network=${networkName}`
  );
  Browser.tabs.create({
    url: hardwareWalletURL,
  });
};
