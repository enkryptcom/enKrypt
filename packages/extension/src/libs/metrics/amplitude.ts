import { init, track, Types } from "@amplitude/analytics-browser";
import { detectBrowser, detectOS } from "@action/utils/browser";
import SettingsState from "../settings-state";

const getUserAge = (installedDate: number) => {
  const date1 = new Date(installedDate);
  const date2 = new Date();
  const Difference_In_Time = date2.getTime() - date1.getTime();
  return Math.round(Difference_In_Time / (1000 * 3600 * 24));
};

class Metrics {
  browser = "";
  os = "";
  arch = "";
  installedTime = 0;
  userId = "";

  constructor() {
    this.init();
    this.browser = detectBrowser();
    detectOS().then((info) => {
      this.os = info.os;
      this.arch = info.arch;
    });
  }
  private init() {
    const settingsState = new SettingsState();
    settingsState.getEnkryptSettings().then((set) => {
      this.installedTime = set.installedTimestamp;
      init("apikey", {
        instanceName: process.env.IS_DEV
          ? "enkrypt-extension-dev"
          : "enkrypt-extension",
        optOut: false,
        serverUrl: process.env.IS_DEV
          ? "https://analytics-enkrypt-dev.mewwallet.dev/record"
          : "https://analytics-enkrypt.mewwallet.dev/record",
        appVersion: process.env.PACKAGE_VERSION as string,
        trackingOptions: {
          ipAddress: false,
        },
        userId: set.randomUserID,
        useBatch: true,
        identityStorage: "none",
        logLevel: Types.LogLevel.None,
        defaultTracking: {
          formInteractions: false,
          pageViews: false,
          sessions: false,
        },
      });
    });
  }
  track(event: string, options: Record<string, unknown>) {
    track(
      event,
      { ...options, userAge: getUserAge(this.installedTime) },
      {
        os_name: this.os,
        platform: this.browser,
        device_model: this.arch,
      }
    );
  }
}

export default Metrics;
