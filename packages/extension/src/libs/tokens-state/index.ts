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

  async addErc20Token(
    chainName: NetworkNames,
    token: CustomErc20Token
  ): Promise<boolean> {
    let state: IState | null = await this.storage.get(StorageKeys.customTokens);

    if (state && state[chainName]) {
      const tokens = state[chainName];
      const existingToken = tokens!.find((t) => {
        if (
          t.type === TokenType.ERC20 &&
          (t as CustomErc20Token).address.toLowerCase() ===
            token.address.toLowerCase()
        ) {
          return true;
        }

        return false;
      });

      if (existingToken) {
        return false;
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
