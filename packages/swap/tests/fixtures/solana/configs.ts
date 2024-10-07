import { NetworkNames } from "@enkryptcom/types";
import { PublicKey } from "@solana/web3.js";
import { toBN } from "web3-utils";
import { NetworkType, TokenType, TokenTypeTo } from "../../../src/types";

export const nodeURL = "https://nodes.mewapi.io/rpc/sol";

export const amount = toBN("100000");

export const fromAddress = "CMGoYEKM8kSXwN9HzYiwRiZRXoMtEAQ98ZiPE9y67T38";
export const toAddress = "3zDT4WonZsGr6x6ysQeuhTHtabpdawZNsjhC6g1yZDEK";

export const fromTokenNative: TokenType = {
  address: "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee",
  decimals: 9,
  logoURI: "",
  name: "Solana",
  symbol: "SOL",
  rank: 1,
  cgId: "solana",
  type: NetworkType.Solana,
};

/** @see https://solscan.io/token/EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v */
export const fromToken: TokenType = {
  address: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
  decimals: 6,
  logoURI:
    "https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v/logo.png",
  name: "USDC",
  symbol: "USDC",
  rank: 5,
  cgId: "usd-coin",
  type: NetworkType.Solana,
};

/** @see https://solscan.io/token/So11111111111111111111111111111111111111112 */
export const toTokenWSOL: TokenTypeTo = {
  address: "So11111111111111111111111111111111111111112",
  decimals: 9,
  logoURI:
    "https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/So11111111111111111111111111111111111111112/logo.png",
  name: "Wrapped SOL",
  symbol: "WSOL",
  rank: 15,
  cgId: "wrapped-solana",
  type: NetworkType.EVM,
  networkInfo: {
    name: NetworkNames.Solana,
    isAddress: (address: string) => {
      try {
        // eslint-disable-next-line no-new
        new PublicKey(address);
        return Promise.resolve(true);
      } catch (err) {
        return Promise.resolve(false);
      }
    },
  },
};

/** @see https://solscan.io/token/Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB */
export const toToken: TokenTypeTo = {
  address: "Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB",
  decimals: 6,
  logoURI:
    "https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB/logo.svg",
  name: "Tether",
  symbol: "USDT",
  rank: 10,
  cgId: "tether",
  type: NetworkType.Solana,
  networkInfo: {
    name: NetworkNames.Solana,
    isAddress: (address: string) => {
      try {
        // eslint-disable-next-line no-new
        new PublicKey(address);
        return Promise.resolve(true);
      } catch (err) {
        return Promise.resolve(false);
      }
    },
  },
};
