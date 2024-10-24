import { init, track, Types, setOptOut } from '@amplitude/analytics-browser';
import { detectBrowser, detectOS } from '@action/utils/browser';
import SettingsState from '../settings-state';

const getUserAge = (installedDate: number) => {
  const date1 = new Date(installedDate);
  const date2 = new Date();
  const Difference_In_Time = date2.getTime() - date1.getTime();
  return Math.round(Difference_In_Time / (1000 * 3600 * 24));
};

class Metrics {
  browser = '';
  os = '';
  arch = '';
  installedTime = 0;
  userId = '';

  constructor() {
    this.init();
    this.browser = detectBrowser();
    detectOS().then(info => {
      this.os = info.os;
      this.arch = info.arch;
    });
  }
  private init() {
    const settingsState = new SettingsState();
    settingsState.getEnkryptSettings().then(set => {
      this.installedTime = set.installedTimestamp;
      if (typeof window !== 'undefined') {
        init('apikey', {
          instanceName: __IS_DEV__
            ? 'enkrypt-extension-dev'
            : 'enkrypt-extension',
          optOut: !set.isMetricsEnabled,
          serverUrl: __IS_DEV__
            ? 'https://analytics-enkrypt-dev.mewwallet.dev/record'
            : 'https://analytics-enkrypt.mewwallet.dev/record',
          appVersion: __PACKAGE_VERSION__,
          trackingOptions: {
            ipAddress: false,
          },
          userId: set.randomUserID,
          useBatch: true,
          identityStorage: 'none',
          sessionTimeout: 15 * 60 * 1000, // 15 mins
          logLevel: Types.LogLevel.None,
          defaultTracking: {
            formInteractions: false,
            pageViews: false,
          },
        });
      }
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
      },
    );
  }
  setOptOut(val: boolean) {
    setOptOut(val);
  }
}

export default Metrics;
