import { SupportedNetworkNames, TokenBalance } from "./types/tokenbalance-mew";
import { NATIVE_TOKEN_ADDRESS } from "../common";
import { numberToHex } from "web3-utils";

interface TokenBalanceType {
  token: string;
  quantity: string;
  error?: unknown;
}

interface AccountBalanceType {
  balance: string;
}

const getBalances = (chain: SupportedNetworkNames, address: string) => {
  return fetch(`https://tomoscan.io/api/account/${address}/tokenBalance`)
    .then((res) => res.json())
    .then(async (json) => {
      if (json.error)
        return Promise.reject(
          `TOKENBALANCE-MEW: ${JSON.stringify(json.error)}`
        );
      else {
        const nativeBalance = await fetch(
          `https://tomoscan.io/api/account/${address}`
        )
          .then((res) => res.json())
          .then((json: AccountBalanceType) => json.balance);
        const newResults = (json.data as TokenBalanceType[]).map((tb: any) => {
          const rawTx: TokenBalance = {
            contract: tb.token.toLowerCase(),
            balance: numberToHex(tb.quantity),
          };
          return rawTx;
        });
        newResults.unshift({
          contract: NATIVE_TOKEN_ADDRESS,
          balance: numberToHex(nativeBalance),
        });
        return newResults.slice(0, 50) as TokenBalance[];
      }
    });
};

export default getBalances;
