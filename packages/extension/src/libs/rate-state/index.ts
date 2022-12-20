import BrowserStorage from "../common/browser-storage";
import { InternalStorageNamespace } from "@/types/provider";
import { IState, StorageKeys } from "./types";

// Two weeks
const POPUP_TIME = 1209600000;

export default class RateState {
  private storage: BrowserStorage;

  constructor() {
    this.storage = new BrowserStorage(InternalStorageNamespace.rateState);
  }

  async showPopup(): Promise<boolean> {
    const state: IState | undefined = await this.storage.get(
      StorageKeys.rateInfo
    );

    if (state) {
      if (!state.alreadyRated) {
        const now = Date.now();

        if (state.popupTime < now) {
          const popupTime = Date.now() + POPUP_TIME;
          state.popupTime = popupTime;

          await this.storage.set(StorageKeys.rateInfo, state);
          return true;
        }
      } else {
        return false;
      }
    }

    const popupTime = Date.now() + POPUP_TIME;
    const newState: IState = {
      popupTime,
      alreadyRated: false,
    };

    this.storage.set(StorageKeys.rateInfo, newState);

    return false;
  }

  async resetPopupTimer(): Promise<void> {
    const state: IState | undefined = await this.storage.get(
      StorageKeys.rateInfo
    );

    const now = Date.now();
    const popupTime = now + POPUP_TIME;

    if (state) {
      state.popupTime = popupTime;
      await this.storage.set(StorageKeys.rateInfo, state);
    } else {
      const newState: IState = {
        alreadyRated: false,
        popupTime,
      };

      await this.storage.set(StorageKeys.rateInfo, newState);
    }
  }

  async setRated(): Promise<void> {
    const state: IState = {
      alreadyRated: true,
      popupTime: 0,
    };

    await this.storage.set(StorageKeys.rateInfo, state);
  }
}
