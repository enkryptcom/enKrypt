import { SOLRawInfo } from "@/types/activity";
import { ProviderAPIInterface } from "@/types/provider";
import { getAddress as getSolAddress } from "../types/sol-network";
import { Connection, PublicKey } from "@solana/web3.js";
import { numberToHex } from "@enkryptcom/utils";
import { ERC20TokenInfo } from "@/providers/ethereum/types";
import cacheFetch from "@/libs/cache-fetch";

class API implements ProviderAPIInterface {
  node: string;
  web3: Connection;

  constructor(node: string) {
    this.node = node;
    this.web3 = new Connection(this.node);
  }

  public get api() {
    return this;
  }
  private getAddress(pubkey: string) {
    return getSolAddress(pubkey);
  }
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  async init(): Promise<void> {}
  async getTransactionStatus(hash: string): Promise<SOLRawInfo | null> {
    console.log(hash, "gettxstatus");
    return null;
  }
  async getBalance(pubkey: string): Promise<string> {
    const balance = await this.web3.getBalance(
      new PublicKey(this.getAddress(pubkey))
    );
    return numberToHex(balance);
  }
  async broadcastTx(rawtx: string): Promise<boolean> {
    console.log(rawtx, "broadcasttx");
    return true;
  }
  getTokenInfo = async (contractAddress: string): Promise<ERC20TokenInfo> => {
    interface TokenDetails {
      address: string;
      decimals: number;
      name: string;
      symbol: string;
    }
    const allTokensResponse = await cacheFetch(
      {
        url: "https://utl.solcast.dev/solana-tokenlist.json",
        postProcess: (data: any) => {
          const allTokens = data.tokens as TokenDetails[];
          const tObj: Record<string, TokenDetails> = {};
          allTokens.forEach((t) => {
            tObj[t.address] = t;
          });
          return tObj;
        },
      },
      60 * 60 * 1000
    );
    const allTokens = allTokensResponse as Record<string, TokenDetails>;
    if (allTokens[contractAddress]) {
      return {
        name: allTokens[contractAddress].name,
        symbol: allTokens[contractAddress].symbol,
        decimals: allTokens[contractAddress].decimals,
      };
    }
    return {
      name: "Unknown",
      symbol: "UNKNWN",
      decimals: 9,
    };
  };
}
export default API;
