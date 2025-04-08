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
    const state = await this.storage.get(StorageKeys.updatesInfo);
    if (!state) {
      const newState: IState = {
        lastVersionViewed: '',
        currentRelease: '',
        currentReleaseTimestamp: 0,
      }
      return newState
    }
    return state;
  }

  async getLastVersionViewed(): Promise<IState['lastVersionViewed']> {
    const state: IState = await this.getState();
    return state?.lastVersionViewed ?? '';
  }
  async setLastVersionViewed(lastVersionViewed: string): Promise<void> {
    const state: IState = await this.getState();
    const newState: IState = { ...state, lastVersionViewed }
    await this.setState(newState);
  }

  async getCurrentRelease(): Promise<IState['currentRelease']> {
    const state: IState = await this.getState();
    return state?.currentRelease ?? '';
  }

  async setCurrentRelease(currentRelease: string): Promise<void> {
    const state: IState = await this.getState();
    const newState: IState = { ...state, currentRelease }
    await this.setState(newState);
  }

  async getCurrentReleaseTimestamp(): Promise<IState['currentReleaseTimestamp']> {
    const state: IState = await this.getState();
    return state?.currentReleaseTimestamp ?? 0;
  }

  async setCurrentReleaseTimestamp(currentReleaseTimestamp: number): Promise<void> {
    const state: IState = await this.getState();
    const newState: IState = { ...state, currentReleaseTimestamp }
    await this.setState(newState);
  }
}

export default UpdatesState;
