import Browser from 'webextension-polyfill';

export const openPrivacy = () => {
  const onboardURL = Browser.runtime.getURL('onboard.html#/user-privacy');
  Browser.tabs.create({
    url: onboardURL,
  });
};
export default () => {
  const onboardURL = Browser.runtime.getURL('onboard.html');
  return Browser.tabs.create({
    url: onboardURL,
  });
};
