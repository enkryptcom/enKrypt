import BrowserStorage from "../common/browser-storage";
import { InternalStorageNamespace } from "@/types/provider";
import { StorageKeys, IState } from "./types";

export default class BannersState {
  private storage: BrowserStorage;

  constructor() {
    this.storage = new BrowserStorage(InternalStorageNamespace.bannersState);
  }

  async showSolanaStackingBanner(): Promise<boolean> {
    const state: IState | undefined = await this.storage.get(
      StorageKeys.bannersInfo
    );

    if (state) {
      return !state.isHideSolanStackingBanner;
    }

    const newState: IState = {
      isHideSolanStackingBanner: false,
      isHideNetworkAssetSolanStackingBanner: false,
    };

    this.storage.set(StorageKeys.bannersInfo, newState);

    return true;
  }

  async showNetworkAssetsSolanaStackingBanner(): Promise<boolean> {
    const state: IState | undefined = await this.storage.get(
      StorageKeys.bannersInfo
    );

    if (state) {
      return !state.isHideNetworkAssetSolanStackingBanner;
    }

    const newState: IState = {
      isHideSolanStackingBanner: false,
      isHideNetworkAssetSolanStackingBanner: false,
    };

    this.storage.set(StorageKeys.bannersInfo, newState);

    return true;
  }

  async hideNetworkAssetsSolanaStackingBanner() {
    const state: IState | undefined = await this.storage.get(
      StorageKeys.bannersInfo
    );

    const newState: IState = {
      isHideSolanStackingBanner: state?.isHideSolanStackingBanner ?? false,
      isHideNetworkAssetSolanStackingBanner: true,
    };

    this.storage.set(StorageKeys.bannersInfo, newState);
  }

  async hideSolanaStackingBanner() {
    const state: IState | undefined = await this.storage.get(
      StorageKeys.bannersInfo
    );

    const newState: IState = {
      isHideSolanStackingBanner: true,
      isHideNetworkAssetSolanStackingBanner: state?.isHideNetworkAssetSolanStackingBanner ?? false,
    };

    this.storage.set(StorageKeys.bannersInfo, newState);
  }
}
