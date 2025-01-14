import { SettingsType } from '@/libs/settings-state/types';

export interface EnkryptWindow {
  enkrypt: {
    providers: {
      [key: string]: any;
    };
    settings: SettingsType;
  };
  unisat?: any;
  [key: string]: any;
}
