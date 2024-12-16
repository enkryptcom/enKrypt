import axios from "axios";

const rpcURL = "https://firo-rpc.publicnode.com/";

export async function callRPC<T = any>(
  method: string,
  params?: object
): Promise<T> {
  try {
    const response = await axios.post(
      rpcURL,
      {
        jsonrpc: "1.0",
        id: "js-client",
        method: method,
        params: params ?? [],
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    return response.data.result;
  } catch (error) {
    console.error("RPC Error:", error);
    throw error;
  }
}
