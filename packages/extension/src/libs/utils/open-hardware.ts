import Browser from "webextension-polyfill";

export default () => {
  const hardwareWalletURL = Browser.runtime.getURL(
    "onboard.html#/hardware-wallet/"
  );
  Browser.tabs.create({
    url: hardwareWalletURL,
  });
};
