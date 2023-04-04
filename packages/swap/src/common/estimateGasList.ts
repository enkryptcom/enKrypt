import fetch from "node-fetch";
import { numberToHex, toBN } from "web3-utils";
import { EVMTransaction, SupportedNetworkName } from "../types";
import { GAS_LIMITS } from "../configs";

const supportedNetworks: {
  [key in SupportedNetworkName]?: { url: string };
} = {
  [SupportedNetworkName.Ethereum]: {
    url: "https://estimategas.mewapi.io/eth",
  },
  [SupportedNetworkName.Binance]: {
    url: "https://estimategas.mewapi.io/bsc",
  },
  [SupportedNetworkName.Matic]: {
    url: "https://estimategas.mewapi.io/matic",
  },
  [SupportedNetworkName.Arbitrum]: {
    url: "https://nodes.mewapi.io/rpc/arb",
  },
};

const useStandardEstimate = (
  transactions: EVMTransaction[],
  network: SupportedNetworkName
): Promise<{
  isError?: boolean;
  errorMessage?: string;
  result?: string[];
} | null> =>
  fetch(supportedNetworks[network].url, {
    method: "POST",
    body: JSON.stringify({
      jsonrpc: "2.0",
      id: 0,
      method: "eth_estimateGas",
      params: [transactions[0]],
    }),
    headers: {
      "Content-Type": "application/json",
    },
  })
    .then((res) => {
      if (res.ok) return res.json();
      throw new Error("Something went wrong");
    })
    .then((json) => {
      if (json.error)
        return {
          isError: true,
          errorMessage: json.error.message,
        };
      const isApproval = transactions[0].data.startsWith("0x095ea7b3");
      const genericTx0Gas = isApproval
        ? toBN(GAS_LIMITS.approval)
        : toBN(GAS_LIMITS.swap);
      const tx0gas = toBN(json.result);
      if (genericTx0Gas.gt(tx0gas)) {
        if (isApproval) {
          return {
            result:
              transactions.length === 2
                ? [json.result, GAS_LIMITS.swap]
                : [json.result, GAS_LIMITS.approval, GAS_LIMITS.swap],
          };
        }
        return {
          result: [json.result],
        };
      }
      const multiplier = tx0gas.div(genericTx0Gas);
      if (isApproval) {
        return {
          result:
            transactions.length === 2
              ? [
                  json.result,
                  numberToHex(toBN(GAS_LIMITS.swap).mul(multiplier.addn(3))),
                ]
              : [
                  json.result,
                  numberToHex(toBN(GAS_LIMITS.approval).mul(multiplier)),
                  numberToHex(toBN(GAS_LIMITS.swap).mul(multiplier.addn(3))),
                ],
        };
      }
      return {
        result: [json.result],
      };
    })
    .catch(() => null);

const estimateGasList = (
  transactions: EVMTransaction[],
  network: SupportedNetworkName
): Promise<{
  isError?: boolean;
  errorMessage?: string;
  result?: string[];
} | null> => {
  if (!Object.keys(supportedNetworks).includes(network as unknown as string))
    return null;
  if (network === SupportedNetworkName.Arbitrum)
    return useStandardEstimate(transactions, network);
  const strippedTxs = transactions.map((tx) => {
    const { from, to, data, value } = tx;
    return {
      from,
      to,
      data,
      value,
    };
  });
  return fetch(supportedNetworks[network].url, {
    method: "POST",
    body: JSON.stringify({
      jsonrpc: "2.0",
      id: 0,
      method: "eth_estimateGasList",
      params: [strippedTxs],
    }),
    headers: {
      "Content-Type": "application/json",
    },
  })
    .then((res) => {
      if (res.ok) return res.json();
      throw new Error("Something went wrong");
    })
    .then((json) => {
      if (json.error)
        return {
          isError: true,
          errorMessage: json.error.message,
        };
      return {
        result: json.result,
      };
    })
    .catch(() => null);
};

export default estimateGasList;
