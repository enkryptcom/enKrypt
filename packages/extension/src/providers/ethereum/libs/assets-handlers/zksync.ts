import { NetworkNames } from "@enkryptcom/types";
import {
  SupportedNetworkNames,
  TokenBalance,
  ZkSyncBalanceType,
} from "./types/tokenbalance-mew";
import { NetworkEndpoints } from "../activity-handlers/providers/etherscan/configs";
import { NATIVE_TOKEN_ADDRESS } from "../common";
import { numberToHex, toBN } from "web3-utils";

const ZKGoerli_ENDPOINT = NetworkEndpoints[NetworkNames.ZkSyncGoerli];
const ZKSync_ENDPOINT = NetworkEndpoints[NetworkNames.ZkSync];

const getBalances = (chain: SupportedNetworkNames, address: string) => {
  const endpoint =
    chain === NetworkNames.ZkSyncGoerli ? ZKGoerli_ENDPOINT : ZKSync_ENDPOINT;
  return fetch(
    `${endpoint}api?module=account&action=tokenlist&address=${address}`
  )
    .then((res) => res.json())
    .then((json) => {
      if (json.status === "0" && json.result === null)
        return Promise.reject(
          `TOKENBALANCE-MEW: ${JSON.stringify(json.message)}`
        );
      else {
        const results: ZkSyncBalanceType[] = json.result;
        const retVal: TokenBalance[] = [];
        const zksyncNativeAddress =
          "0x000000000000000000000000000000000000800a";
        results.forEach((bal) => {
          retVal.push({
            contract:
              bal.contractAddress === zksyncNativeAddress
                ? NATIVE_TOKEN_ADDRESS
                : bal.contractAddress,
            balance: numberToHex(toBN(bal.balance)),
          });
        });
        const isNativeAvailable = json.result.length
          ? json.result.find((i: any) => i.contract === NATIVE_TOKEN_ADDRESS)
          : false;
        if (!isNativeAvailable) {
          retVal.push({
            contract: NATIVE_TOKEN_ADDRESS,
            balance: "0x0",
          });
        }
        return retVal;
      }
    });
};

export default getBalances;
