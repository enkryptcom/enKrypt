import BrowserStorage from '../common/browser-storage';
import { InternalStorageNamespace } from '@/types/provider';
import { IState, StorageKeys } from './types';

class UpdatesState {
  private storage: BrowserStorage;

  constructor() {
    this.storage = new BrowserStorage(InternalStorageNamespace.updatesState);
  }

  async setState(state: IState): Promise<void> {
    return this.storage.set(StorageKeys.updatesInfo, state);
  }

  async getState(): Promise<IState> {
    return this.storage.get(StorageKeys.updatesInfo);
  }

  async getLastVersionViewed(): Promise<IState['lastVersionViewed']> {
    const state: IState | undefined = await this.getState();
    if (state && state.lastVersionViewed) {
      return state.lastVersionViewed;
    }
    return '';
  }
  async setLastVersionViewed(lastVersionViewed: string): Promise<void> {
    const state: IState | undefined = await this.getState();
    const newState: IState = { ...state, lastVersionViewed }
    await this.setState(newState);
  }

  async getCurrentRelease(): Promise<IState['currentRelease']> {
    const state: IState | undefined = await this.getState();
    if (state && state.currentRelease) {
      return state.currentRelease;
    }
    return ''
  }

  async setCurrentRelease(currentRelease: string): Promise<void> {
    const state: IState | undefined = await this.getState();
    const newState: IState = { ...state, currentRelease }
    await this.setState(newState);
  }

  async getCurrentReleaseTimestamp(): Promise<IState['currentReleaseTimestamp']> {
    const state: IState | undefined = await this.getState();
    if (state && state.currentReleaseTimestamp) {
      return state.currentReleaseTimestamp;
    }
    return 0
  }

  async setCurrentReleaseTimestamp(currentReleaseTimestamp: number): Promise<void> {
    const state: IState | undefined = await this.getState();
    const newState: IState = { ...state, currentReleaseTimestamp }
    await this.setState(newState);
  }
}

export default UpdatesState;
