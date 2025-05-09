import BrowserStorage from '../common/browser-storage';
import { InternalStorageNamespace } from '@/types/provider';
import { IState, StorageKeys } from './types';

const POPUP_TIME = 2592000000; // 30 days

export default class RateState {
  private storage: BrowserStorage;

  constructor() {
    this.storage = new BrowserStorage(InternalStorageNamespace.rateState);
  }

  /**
   * 
   * @param immediate 
   * @returns boolean
   * 
   * allow popup to show immediately
   * 
   */
  async showPopup(immediate: boolean = false): Promise<boolean> {
    const state: IState | undefined = await this.storage.get(
      StorageKeys.rateInfo,
    );
    const now = Date.now();
    const popupTime = Date.now() + POPUP_TIME;

    if (state) {
      if (!state.askedAfterActivity) {
        console.log('askedAfterActivity', state);
        if (state.popupTime < now) {
          state.askedAfterActivity = true;

          await this.storage.set(StorageKeys.rateInfo, state);
          return true;
        }
      }
      if (!state.alreadyRated && !state.askedAfterActivity) {
        if (state.popupTime < now) {
          state.popupTime = popupTime;

          await this.storage.set(StorageKeys.rateInfo, state);
          return true;
        }
      } else {
        return false;
      }

      if (immediate) return false
    }

    const newState: IState = {
      popupTime,
      alreadyRated: false,
      askedAfterActivity: immediate,
    };

    this.storage.set(StorageKeys.rateInfo, newState);
    return immediate;
  }

  async resetPopupTimer(): Promise<void> {
    const state: IState | undefined = await this.storage.get(
      StorageKeys.rateInfo,
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
