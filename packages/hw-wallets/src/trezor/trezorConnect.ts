import type { TrezorConnect as TrezorConnectType } from "@trezor/connect-web";

const getTrezorConnect = async () => {
  if (chrome && chrome.runtime && chrome.runtime.getPlatformInfo) {
    const TrezorConnect = await import("@trezor/connect-webextension");
    await TrezorConnect.default.init({
      manifest: {
        email: "info@enkrypt.com",
        appUrl: "https://www.enkrypt.com",
      },
      transports: ["BridgeTransport", "WebUsbTransport"],
      connectSrc: "https://connect.trezor.io/9/",
      _extendWebextensionLifetime: true,
    });
    return TrezorConnect.default as TrezorConnectType;
  } else {
    const TrezorConnect = ((await import("@trezor/connect-web")) as any)
      .default;
    await TrezorConnect.default.init({
      lazyLoad: true,
      manifest: {
        email: "info@enkrypt.com",
        appUrl: "http://www.myetherwallet.com",
      },
    });
    return TrezorConnect.default as TrezorConnectType;
  }
};

export default getTrezorConnect;
