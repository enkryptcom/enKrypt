import BrowserStorage from "../common/browser-storage";
import { InternalStorageNamespace } from "@/types/provider";
import {
  IState,
  StorageKeys,
  CustomToken,
  CustomErc20Token,
  TokenType,
} from "./types";
import { NetworkNames } from "@enkryptcom/types";

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
    token: CustomErc20Token
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

  async getTokensByNetwork(chainName: NetworkNames): Promise<CustomToken[]> {
    const state: IState | null = await this.storage.get(
      StorageKeys.customTokens
    );

    if (state) {
      return state[chainName] ?? [];
    }

    return [];
  }
}
