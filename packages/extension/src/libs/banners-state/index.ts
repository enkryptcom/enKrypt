import BrowserStorage from '../common/browser-storage';
import { InternalStorageNamespace } from '@/types/provider';
import { StorageKeys, IState } from './types';

export default class BannersState {
  private storage: BrowserStorage;

  constructor() {
    this.storage = new BrowserStorage(InternalStorageNamespace.bannersState);
  }

  private async getOrInitializeState(): Promise<IState> {
    const state: IState | undefined = await this.storage.get(
      StorageKeys.bannersInfo,
    );
    if (state) {
      return state;
    }
    const newState: IState = {
      isHideSolanStakingBanner: false,
      isHideNetworkAssetSolanStakingBanner: false,
      isHideSurveyPopup: false,
    };
    await this.storage.set(StorageKeys.bannersInfo, newState);
    return newState;
  }

  async resetBanners(): Promise<void> {
    const state = await this.getOrInitializeState();
    state.isHideNetworkAssetSolanStakingBanner = false;
    state.isHideSolanStakingBanner = false;
    state.isHideSurveyPopup = false;
    await this.storage.set(StorageKeys.bannersInfo, state);
  }

  async showSolanaStakingBanner(): Promise<boolean> {
    const state = await this.getOrInitializeState();
    return !state.isHideSolanStakingBanner;
  }

  async showNetworkAssetsSolanaStakingBanner(): Promise<boolean> {
    const state = await this.getOrInitializeState();
    return !state.isHideNetworkAssetSolanStakingBanner;
  }

  async hideNetworkAssetsSolanaStakingBanner() {
    const state = await this.getOrInitializeState();
    state.isHideNetworkAssetSolanStakingBanner = true;
    await this.storage.set(StorageKeys.bannersInfo, state);
  }

  async hideSolanaStakingBanner() {
    const state = await this.getOrInitializeState();
    state.isHideSolanStakingBanner = true;
    await this.storage.set(StorageKeys.bannersInfo, state);
  }

  async showSurveyPopup(): Promise<boolean> {
    const state = await this.getOrInitializeState();
    return !state.isHideSurveyPopup;
  }

  async hideSurveyPopup() {
    const state = await this.getOrInitializeState();
    state.isHideSurveyPopup = true;
    await this.storage.set(StorageKeys.bannersInfo, state);
  }
}
