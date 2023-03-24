import fetch from "node-fetch";
import { EVMTransaction, SupportedNetworkName } from "../types";

const supportedNetworks: {
  [key in SupportedNetworkName]?: { url: string };
} = {
  [SupportedNetworkName.Ethereum]: {
    url: "https://estimategas.mewapi.io/eth",
  },
  [SupportedNetworkName.Binance]: {
    url: "https://estimategas.mewapi.io/goerli",
  },
  [SupportedNetworkName.Matic]: {
    url: "https://estimategas.mewapi.io/matic",
  },
};

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
    .then((res) => res.json())
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
