import { SettingsType } from "@/libs/settings-state/types";

export interface EnkryptWindow {
  enkrypt: {
    providers: {
      [key: string]: any;
    };
    settings: SettingsType;
  };
  [key: string]: any;
}
