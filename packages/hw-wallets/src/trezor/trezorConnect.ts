import type { TrezorConnect as TrezorConnectType } from "@trezor/connect-web";

const getTrezorConnect = async () => {
  if (chrome.runtime) {
    const TrezorConnect = (await import("@trezor/connect-webextension"))
      .default;
    await TrezorConnect.init({
      manifest: {
        email: "info@enkrypt.com",
        appUrl: "https://www.enkrypt.com",
      },
      transports: ["BridgeTransport", "WebUsbTransport"],
      connectSrc: "https://connect.trezor.io/9/",
      _extendWebextensionLifetime: true,
    });
    return TrezorConnect as TrezorConnectType;
  } else {
    const TrezorConnect = (await import("@trezor/connect-web")).default;
    await TrezorConnect.init({
      lazyLoad: true,
      manifest: {
        email: "info@enkrypt.com",
        appUrl: "http://www.myetherwallet.com",
      },
    });
    return TrezorConnect as TrezorConnectType;
  }
};

export default getTrezorConnect;
