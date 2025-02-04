import Browser from 'webextension-polyfill';
import { Updates } from '@/ui/action/types/updates';
export const BROWSER_NAMES = {
  chrome: 'chrome',
  firefox: 'firefox',
  brave: 'brave',
  edge: 'edge',
  opera: 'opera',
  safari: 'safari',
};

export const detectOS = (): Promise<{ os: string; arch: string }> => {
  return Browser.runtime.getPlatformInfo().then(info => {
    return {
      os: info.os,
      arch: info.arch,
    };
  });
};

export const detectBrowser = (): string => {
  const { userAgent } = navigator;

  if (userAgent.match(/^((?!chrome|android).)*safari/i)) {
    return BROWSER_NAMES.safari;
  }
  if (userAgent.match(/Opera|OPR/i)) {
    return BROWSER_NAMES.opera;
  }
  if (userAgent.match(/edg/i)) {
    return BROWSER_NAMES.edge;
  }
  if (userAgent.match(/chrome|chromium|crios/i)) {
    return BROWSER_NAMES.chrome;
  }
  if (userAgent.match(/firefox|fxios/i)) {
    return BROWSER_NAMES.firefox;
  }
  return '';
};

export const openLink = (url: string) => {
  if (detectBrowser() === BROWSER_NAMES.firefox) {
    Browser.windows.create({ url, focused: true });
  } else {
    window.open(url, '_blank', 'noopener');
  }
};

export const getLatestEnkryptVersion = (): Promise<string> => {
  return fetch(
    'https://raw.githubusercontent.com/enkryptcom/dynamic-data/main/configs/versions.json',
    { cache: "no-store" }
  )
    .then(res => res.json())
    .then(versions => {
      const browser = detectBrowser();
      if (versions[browser] && browser === BROWSER_NAMES.safari)
        return versions[browser];
      return null;
    })
    .catch(() => null);
};

export const getLatestEnkryptUpdates = (): Promise<Updates | null> => {

  const browser = detectBrowser();
  const url = 'https://raw.githubusercontent.com/enkryptcom/dynamic-data/main/configs/release-versions'
  const fetchUrl = browser === BROWSER_NAMES.safari ? `${url}-safari.json` : `${url}.json`
  return fetch(
    fetchUrl
  )
    .then(res => res.json())
    .catch((error) => {
      console.error('Failed to fetch updates:', error);
      return null
    }
    );
};
