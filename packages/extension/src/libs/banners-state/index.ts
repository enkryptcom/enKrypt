import BrowserStorage from "../common/browser-storage";
import { InternalStorageNamespace } from "@/types/provider";
import { StorageKeys, IState } from "./types";

export default class BannersState {
  private storage: BrowserStorage;

  constructor() {
    this.storage = new BrowserStorage(InternalStorageNamespace.bannersState);
  }

  async showMewwalletBanner(): Promise<boolean> {
    const state: IState | undefined = await this.storage.get(
      StorageKeys.bannersInfo
    );

    if (state) {
      return !state.isHideMewwalletBanner;
    }

    const newState: IState = {
      isHideMewwalletBanner: false,
    };

    this.storage.set(StorageKeys.bannersInfo, newState);

    return true;
  }

  async hideMewwalletBanner() {
    const state: IState = {
      isHideMewwalletBanner: true,
    };

    this.storage.set(StorageKeys.bannersInfo, state);
  }
}
