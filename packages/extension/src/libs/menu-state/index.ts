import BrowserStorage from '../common/browser-storage';
import { InternalStorageNamespace } from '@/types/provider';
import { IState, StorageKeys } from './types';

class MenuState {
  private storage: BrowserStorage;

  constructor() {
    this.storage = new BrowserStorage(InternalStorageNamespace.menuState);
  }

  async setState(state: IState): Promise<void> {
    return this.storage.set(StorageKeys.menuState, state);
  }

  async getState(): Promise<IState> {
    const state = await this.storage.get(StorageKeys.menuState);
    if (!state) {
      const newState: IState = {
        isExpanded: true,
      };
      return newState;
    }
    return state;
  }

  async getIsExpanded(): Promise<IState['isExpanded']> {
    const state: IState = await this.getState();
    return state?.isExpanded ?? true;
  }
  async setIsExpanded(isExpanded: boolean): Promise<void> {
    const state: IState = await this.getState();
    const newState: IState = { ...state, isExpanded };
    await this.setState(newState);
  }
}

export default MenuState;
