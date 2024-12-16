import { SOLRawInfo } from '@/types/activity';
import { ProviderAPIInterface } from '@/types/provider';
import { getAddress as getSolAddress } from '../types/sol-network';
import { Connection, PublicKey } from '@solana/web3.js';
import { hexToBuffer, numberToHex } from '@enkryptcom/utils';
import cacheFetch from '@/libs/cache-fetch';
import { SPLTokenInfo } from '../types/sol-token';

/** Solana API wrapper */
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

  async init(): Promise<void> { }

  /**
   * Returns null if the transaction hasn't been received by the node
   * or has been dropped
   */
  async getTransactionStatus(hash: string): Promise<SOLRawInfo | null> {
    const tx = await this.web3.getTransaction(hash, {
      maxSupportedTransactionVersion: 0,
      commitment: 'confirmed',
    })

    if (!tx) {
      // Transaction hasn't been picked up by the node
      // (maybe it's too soon, or maybe node is behind, or maybe it's been dropped)
      return null;
    }

    const retVal: SOLRawInfo = {
      blockNumber: tx.slot,
      timestamp: tx.blockTime,
      transactionHash: hash,
      status: tx.meta?.err ? false : true,
    };

    return retVal;
  }

  async getBalance(pubkey: string): Promise<string> {
    const balance = await this.web3.getBalance(
      new PublicKey(this.getAddress(pubkey)),
    );
    return numberToHex(balance);
  }

  async broadcastTx(rawtx: string): Promise<boolean> {
    return this.web3
      .sendRawTransaction(hexToBuffer(rawtx))
      .then(() => true)
      .catch(() => false);
  }

  getTokenInfo = async (contractAddress: string): Promise<SPLTokenInfo> => {
    interface TokenDetails {
      address: string;
      decimals: number;
      name: string;
      symbol: string;
      logoURI: string;
      extensions?: { coingeckoId: string };
    }
    const allTokensResponse = await cacheFetch(
      {
        url: 'https://raw.githubusercontent.com/solflare-wallet/token-list/refs/heads/master/solana-tokenlist.json',
        postProcess: (data: any) => {
          const allTokens = data.tokens as TokenDetails[];
          const tObj: Record<string, TokenDetails> = {};
          allTokens.forEach(t => {
            tObj[t.address] = t;
          });
          return tObj;
        },
      },
      6 * 60 * 60 * 1000,
    );
    const allTokens = allTokensResponse as Record<string, TokenDetails>;
    let decimals = 9;
    if (allTokens[contractAddress]) {
      return {
        name: allTokens[contractAddress].name,
        symbol: allTokens[contractAddress].symbol,
        decimals: allTokens[contractAddress].decimals,
        icon: allTokens[contractAddress].logoURI,
        cgId: allTokens[contractAddress].extensions?.coingeckoId
          ? allTokens[contractAddress].extensions?.coingeckoId
          : undefined,
      };
    } else {
      await this.web3
        .getParsedAccountInfo(new PublicKey(contractAddress))
        .then(info => {
          decimals = (info.value?.data as any).parsed.info.decimals;
        })
        .catch(() => {
          decimals = 9;
        });
    }
    return {
      name: 'Unknown',
      symbol: 'UNKNWN',
      decimals,
      icon: undefined,
      cgId: undefined,
    };
  };
}
export default API;
