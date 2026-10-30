import Browser from 'webextension-polyfill';
import { OnboardRoutePath } from '@/ui/onboard/route-enums';
export default (networkName: string) => {
  const hardwareWalletURL = Browser.runtime.getURL(
    `onboard.html#${OnboardRoutePath.HardwareWalletRoot}?network=${networkName}`,
  );
  Browser.tabs.create({
    url: hardwareWalletURL,
  });
};
