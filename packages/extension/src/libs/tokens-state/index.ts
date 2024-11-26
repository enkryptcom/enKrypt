import BrowserStorage from '../common/browser-storage';
import { InternalStorageNamespace } from '@/types/provider';
import {
  IState,
  StorageKeys,
  CustomToken,
  CustomErc20Token,
  TokenType,
} from './types';
import { NetworkNames } from '@enkryptcom/types';

export class TokensState {
  private storage: BrowserStorage;

  constructor() {
    this.storage = new BrowserStorage(InternalStorageNamespace.tokensState);
  }

  /**
   * Add a new custom ERC20 token for a given network.
   * Returns `true` if the token was added and false otherwise.
   * @param {NetworkNames} chainName - The name of the network the token is being added to.
   * @param {CustomErc20Token} token - The token information being added.
   */
  async addErc20Token(
    chainName: NetworkNames,
    token: CustomErc20Token,
  ): Promise<boolean> {
    let state: IState | null = await this.storage.get(StorageKeys.customTokens);

    if (state && state[chainName]) {
      const tokens = state[chainName];

      for (const t of tokens!) {
        if (
          t.type === TokenType.ERC20 &&
          (t as CustomErc20Token).address.toLowerCase() ===
          token.address.toLowerCase()
        ) {
          return false;
        }
      }

      tokens!.push(token);
    } else {
      if (state) {
        state[chainName] = [token];
      } else {
        state = { [chainName]: [token] };
      }
    }

    this.storage.set(StorageKeys.customTokens, state);
    return true;
  }

  /**
   * Remove a custom ERC20 token from a given network.
   * Returns `true` if the token was removed and false otherwise.
   * @param {NetworkNames} chainName - The name of the network the token is being removed from.
   * @param {string} address - The address of the token being removed.
   */
  async removeErc20Token(
    chainName: NetworkNames,
    address: string,
  ): Promise<boolean> {
    const state: IState | null = await this.storage.get(StorageKeys.customTokens);

    if (state && state[chainName]) {
      const tokens = state[chainName];

      for (let i = 0; i < tokens!.length; i++) {
        const token = tokens![i];

        if (
          token.type === TokenType.ERC20 &&
          (token as CustomErc20Token).address.toLowerCase() ===
          address.toLowerCase()
        ) {
          tokens!.splice(i, 1);

          if (tokens!.length === 0) {
            delete state[chainName];
          }

          await this.storage.set(StorageKeys.customTokens, state);
          return true;
        }
      }
    }

    return false;
  }

  async getTokensByNetwork(chainName: NetworkNames): Promise<CustomToken[]> {
    const state: IState | null = await this.storage.get(
      StorageKeys.customTokens,
    );

    if (state) {
      return state[chainName] ?? [];
    }

    return [];
  }
}
