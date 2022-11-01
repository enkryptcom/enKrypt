import { NetworkNames } from "@enkryptcom/types";
import { v4 } from "uuid";

const broadcastTx = (hexTx: string, network: NetworkNames): Promise<string> => {
  if (network === NetworkNames.Ethereum) {
    const burl = "https://broadcast.mewapi.io/eth?product=enkrypt";
    return fetch(burl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        jsonrpc: "2.0",
        method: "eth_sendRawTransaction",
        params: [hexTx],
        id: v4(),
      }),
    })
      .then((response) => response.json())
      .then((jRes) => {
        if (jRes.error) return Promise.reject(jRes.error);
        else return jRes.result as string;
      });
  }
  return Promise.reject("Not valid network");
};

export default broadcastTx;
