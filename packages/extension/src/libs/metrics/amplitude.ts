import { init, track, Types } from "@amplitude/analytics-browser";
import { detectBrowser, detectOS } from "@action/utils/browser";

class Metrics {
  browser = "";
  os = "";
  arch = "";
  constructor() {
    this.init();
    this.browser = detectBrowser();
    detectOS().then((info) => {
      this.os = info.os;
      this.arch = info.arch;
    });
  }
  private init() {
    init("apikey", {
      instanceName: "enkrypt-extension-prod",
      optOut: false,
      serverUrl: "https://analytics-web.mewwallet.dev/record",
      appVersion: process.env.PACKAGE_VERSION as string,
      trackingOptions: {
        ipAddress: false,
      },
      useBatch: true,
      identityStorage: "none",
      logLevel: Types.LogLevel.None,
      defaultTracking: {
        formInteractions: false,
        pageViews: false,
        sessions: false,
      },
    });
  }
  track(event: string, options: Record<string, unknown>) {
    track(event, options, {
      os_name: this.os,
      platform: this.browser,
      device_model: this.arch,
    });
  }
}

export default Metrics;
