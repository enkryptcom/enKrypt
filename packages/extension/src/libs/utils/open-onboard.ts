import Browser from "webextension-polyfill";

export default () => {
  const onboardURL = Browser.runtime.getURL("onboard.html");
  Browser.tabs.create({
    url: onboardURL,
  });
};
